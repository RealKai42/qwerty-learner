// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use sha2::{Digest, Sha256};
use std::path::PathBuf;
use tauri::http::{Request, Response, StatusCode};
use tauri::{Manager, Runtime, UriSchemeContext, UriSchemeResponder};

/// 发音音频只允许代理这一个来源，避免自定义协议变成任意 URL 的转发器。
const ALLOWED_AUDIO_HOST: &str = "dict.youdao.com";

/// 有道对超长输入会直接 500，这里给一个宽松上限挡掉明显异常的请求。
const MAX_REMOTE_URL_LEN: usize = 512;

fn error_response(status: StatusCode) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .body(Vec::new())
        .expect("failed to build error response")
}

fn audio_response(bytes: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "audio/mpeg")
        // 音频按 URL 内容寻址，缓存后不会再变，可以让 webview 长期持有。
        .header("Cache-Control", "public, max-age=31536000, immutable")
        .body(bytes)
        .expect("failed to build audio response")
}

/// 从 `pron://` 请求里取出被代理的远端地址。
///
/// 前端用 base64url 编码后拼进路径，这样地址里的 `?` `&` 不会被当成
/// 自定义协议自己的查询串解析。
fn decode_remote_url(request: &Request<Vec<u8>>) -> Option<String> {
    let encoded = request.uri().path().trim_start_matches('/');
    if encoded.is_empty() {
        return None;
    }

    let decoded = URL_SAFE_NO_PAD.decode(encoded).ok()?;
    let url = String::from_utf8(decoded).ok()?;
    if url.len() > MAX_REMOTE_URL_LEN {
        return None;
    }

    let parsed = reqwest::Url::parse(&url).ok()?;
    if parsed.scheme() != "https" || parsed.host_str() != Some(ALLOWED_AUDIO_HOST) {
        return None;
    }

    Some(url)
}

/// 缓存文件按远端地址的 sha256 命名：同一个词 + 同一种发音必然落到同一个文件，
/// 而词本身可能含有空格、斜杠等不适合直接做文件名的字符。
fn cache_path_for(cache_dir: &PathBuf, remote_url: &str) -> PathBuf {
    let digest = Sha256::digest(remote_url.as_bytes());
    cache_dir.join(format!("{:x}.mp3", digest))
}

async fn load_or_fetch(cache_dir: PathBuf, remote_url: String) -> Result<Vec<u8>, StatusCode> {
    let path = cache_path_for(&cache_dir, &remote_url);

    if let Ok(bytes) = tokio::fs::read(&path).await {
        if !bytes.is_empty() {
            return Ok(bytes);
        }
    }

    let response = reqwest::get(&remote_url)
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    // 有道查不到音频时返回 500 + 一段 JSON，不能把它当成音频缓存下来。
    if !response.status().is_success() {
        return Err(StatusCode::NOT_FOUND);
    }
    let is_audio = response
        .headers()
        .get("content-type")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("audio/"));
    if !is_audio {
        return Err(StatusCode::NOT_FOUND);
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .to_vec();
    if bytes.is_empty() {
        return Err(StatusCode::NOT_FOUND);
    }

    // 写盘失败不影响本次播放，只是下次还得重新下载。
    if tokio::fs::create_dir_all(&cache_dir).await.is_ok() {
        let _ = tokio::fs::write(&path, &bytes).await;
    }

    Ok(bytes)
}

fn handle_pronunciation_request<R: Runtime>(
    context: UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    let Some(remote_url) = decode_remote_url(&request) else {
        responder.respond(error_response(StatusCode::BAD_REQUEST));
        return;
    };

    let Ok(cache_dir) = context
        .app_handle()
        .path()
        .app_cache_dir()
        .map(|dir| dir.join("pronunciation"))
    else {
        responder.respond(error_response(StatusCode::INTERNAL_SERVER_ERROR));
        return;
    };

    tauri::async_runtime::spawn(async move {
        match load_or_fetch(cache_dir, remote_url).await {
            Ok(bytes) => responder.respond(audio_response(bytes)),
            Err(status) => responder.respond(error_response(status)),
        }
    });
}

fn main() {
    tauri::Builder::default()
        .register_asynchronous_uri_scheme_protocol("pron", handle_pronunciation_request)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
