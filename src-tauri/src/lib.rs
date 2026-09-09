// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(mobile, tauri::mobile_entry_point)]

pub fn run() {
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
