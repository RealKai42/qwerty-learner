#!/usr/bin/env python3
"""Make English headwords typeable.

Dictionary entries sometimes store two spellings in one name, as in
"a/an", "among(st)", or "apologise(apologize)". Practice asks the learner
to type name exactly, so the annotation becomes part of the exercise.

This keeps one spelling in name and records the other form on trans.
Code, romaji, German, and other languages are left alone: their symbols
are the text the learner is meant to type.
"""

import argparse
import copy
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DICTIONARY_TS = ROOT / "src" / "resources" / "dictionary.ts"
DICTS = ROOT / "public" / "dicts"

SPELLING_SUFFIXES = {"s", "l", "st", "me", "ue", "al", "ed", "es", "m", "u", "e", "r"}
# A parenthetical that explains the entry instead of adding letters.
GRAMMAR = {"sb", "sth", "irr", "abbr", "be", "eg", "e.g", "ie", "i.e"}
# Small words wrapped in parentheses between two parts of a phrase.
FUNCTION_WORDS = {
    "a",
    "an",
    "the",
    "of",
    "to",
    "in",
    "on",
    "upon",
    "with",
    "again",
    "am",
    "is",
    "are",
    "not",
    "do",
    "for",
}
SPELLING_PAIRS = {("z", "s"), ("s", "c")}
TOKEN_SPELLING = re.compile(r"\([A-Za-z]{1,3}\)")


def english_dicts():
    text = DICTIONARY_TS.read_text(encoding="utf-8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"^\s*//.*$", "", text, flags=re.M)
    found = []
    for match in re.finditer(r"\{([^{}]*)\}", text, flags=re.S):
        body = match.group(1)
        dict_id = re.search(r"id:\s*'([^']+)'", body)
        url = re.search(r"url:\s*'(/dicts/[^']+)'", body)
        language = re.search(r"language:\s*'([^']+)'", body)
        if dict_id and url and language and language.group(1) == "en":
            found.append((dict_id.group(1), url.group(1)))
    return found


def normalize_punctuation(name):
    return (
        name.replace("’", "'")
        .replace("‘", "'")
        .replace("＇", "'")
        .replace("“", '"')
        .replace("”", '"')
        .replace("（", "(")
        .replace("）", ")")
        .replace("／", "/")
        .replace("＼", "\\")
    )


def unwrap_quotes(name):
    if len(name) >= 2 and name[0] == name[-1] and name[0] in {'"', "'"}:
        inner = name[1:-1]
        if inner and inner[0] not in {'"', "'"} and inner[-1] not in {'"', "'"}:
            return inner
    return name


def expand_spelling_token(token):
    """Return (typed form, alternate or None) for one parenthetical token."""
    matched = re.fullmatch(r"([A-Za-z]*)\(([A-Za-z]{1,3})\)([A-Za-z]*)", token)
    if not matched:
        return token, None
    prefix, extra, suffix = matched.group(1), matched.group(2), matched.group(3)
    # on(a)vacation is a phrase. (a)esthetic is an optional letter.
    if extra.lower() in GRAMMAR or (extra.lower() in FUNCTION_WORDS and prefix and suffix):
        return token, None
    # apologize(s)e and license(c)e put the other ending after the kept ending.
    swapped = re.fullmatch(r"([A-Za-z]*)([zs])e\(([sc])\)e", token)
    if swapped and (swapped.group(2), swapped.group(3)) in SPELLING_PAIRS:
        stem = swapped.group(1)
        return stem + swapped.group(2) + "e", stem + swapped.group(3) + "e"
    # minimiz(s)e writes the alternative letter directly before the final e.
    swapped = re.fullmatch(r"([A-Za-z]*)([zs])\(([sc])\)e", token)
    if swapped and (swapped.group(2), swapped.group(3)) in SPELLING_PAIRS:
        stem = swapped.group(1)
        return stem + swapped.group(2) + "e", stem + swapped.group(3) + "e"
    if extra.lower() not in SPELLING_SUFFIXES and not (len(extra) == 1 and suffix):
        return token, None
    omitted = prefix + suffix
    inserted = prefix + extra + suffix
    if len(omitted) < 2 or omitted == inserted:
        return token, None
    return omitted, inserted


def expand_spellings(name):
    notes = []

    def replace(match):
        token = match.group(0)
        # The match includes the surrounding letters. Re-parse the token.
        typed, alternate = expand_spelling_token(token)
        if alternate:
            notes.append(alternate)
        return typed

    # Expand tokens such as among(st) or labo(u)r, including inside a phrase.
    pattern = re.compile(r"[A-Za-z]*\([A-Za-z]{1,3}\)[A-Za-z]*")
    updated = pattern.sub(replace, name)
    return updated, notes


def simple_alternative(part):
    part = part.strip()
    if not part or len(part) > 40 or "..." in part or "…" in part:
        return False
    if part.count(" ") > 4 or re.search(r"[:;,]", part):
        return False
    if re.fullmatch(r"[\d.]+", part):
        return False
    return re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9' .\-]*", part) is not None


def split_alternatives(name, separator):
    parts = [part.strip() for part in name.split(separator)]
    if len(parts) < 2 or any(not simple_alternative(part) for part in parts):
        return name, []
    # c/o and b/l are the headword. a/an is two words.
    if all(len(part) == 1 for part in parts):
        return name, []
    counts = [len(part.split()) for part in parts]
    acronym = (
        len(parts) == 2
        and counts == [1, counts[1]]
        and 2 <= counts[1] <= 6
        and parts[0].isupper()
        and "".join(word[0] for word in parts[1].split() if word[:1].isalpha()).upper().startswith(parts[0])
    )
    # have/catch a cold puts the shared tail on only one side, so the counts differ.
    if not acronym and len(set(counts)) != 1:
        return name, []
    kept = parts[0]
    notes = []
    for part in parts[1:]:
        if part and part.lower() != kept.lower() and part not in notes:
            notes.append(part)
    return kept, notes


def strip_glosses(name):
    notes = []

    def replace(match):
        inside = match.group(1).strip()
        if inside.startswith("=") or inside.startswith("/"):
            inside = inside[1:].strip()
        prefix = name[: match.start()]
        suffix = name[match.end() :]
        # cell(ular)phone is one word with a parenthetical piece, not a gloss.
        if (
            re.fullmatch(r"[A-Za-z]+", inside)
            and prefix
            and suffix
            and prefix[-1].isalpha()
            and suffix[0].isalpha()
            and inside.lower() not in GRAMMAR
            and inside.lower() not in FUNCTION_WORDS
        ):
            return inside + " "
        if inside and set(inside) <= set("."):
            notes.append("")
            return " "
        if inside:
            notes.append(inside)
        return " "

    updated = re.sub(r"\(([^)]*)\)", replace, name)
    updated = re.sub(r"\s+([.,=])", r"\1", updated)
    updated = re.sub(r"\s+", " ", updated).strip()
    return updated, [note for note in notes if note]


def normalize_name(name):
    updated = unwrap_quotes(normalize_punctuation(name))
    updated = updated.replace("()", "-")
    updated, spelling_notes = expand_spellings(updated)
    slash_notes = []
    for separator in ("/", "\\"):
        if separator in updated:
            updated, found = split_alternatives(updated, separator)
            slash_notes.extend(found)
            break
    updated, glosses = strip_glosses(updated)
    if "(" in updated or ")" in updated or not re.search(r"[A-Za-z0-9]", updated):
        return name, []
    notes = []
    for alternate in spelling_notes + slash_notes:
        label = f"也作 {alternate}"
        if label not in notes:
            notes.append(label)
    for gloss in glosses:
        plain_word = re.fullmatch(r"[A-Za-z][A-Za-z'-]{2,40}", gloss) or gloss.isupper()
        if plain_word and gloss.lower() not in GRAMMAR and gloss.lower() not in FUNCTION_WORDS:
            label = f"也作 {gloss}"
        else:
            label = f"（{gloss}）"
        if label not in notes:
            notes.append(label)
    if updated == name and not notes:
        return name, []
    return updated, notes


def trans_text(trans):
    if isinstance(trans, list):
        return " ".join(str(item) for item in trans)
    if trans is None:
        return ""
    return str(trans)


def append_notes(word, notes):
    if not notes:
        return False
    existing = trans_text(word.get("trans"))
    fresh = [note for note in notes if note not in existing]
    if not fresh:
        return False
    trans = word.get("trans")
    if isinstance(trans, list):
        trans.extend(fresh)
    elif isinstance(trans, str):
        word["trans"] = trans + "；" + "；".join(fresh)
    elif trans is None:
        word["trans"] = fresh
    else:
        return False
    return True


def recover_name(word):
    """Fill a name only when the row already determines it."""
    if word.get("name") is False:
        return "false"
    if "name" not in word or word.get("name") is None:
        phones = " ".join(str(word.get(key) or "") for key in ("usphone", "ukphone"))
        if "wɪɡ" in phones or "wɪg" in phones:
            return "wig"
    return None


def transform(word):
    """Return a new word dict, or None when the row should stay as it is."""
    if not isinstance(word, dict):
        return None
    original = copy.deepcopy(word)
    recovered = recover_name(original)
    if recovered is not None:
        original["name"] = recovered
    name = original.get("name")
    if not isinstance(name, str):
        return None
    renamed, notes = normalize_name(name)
    if renamed == name and recovered is None and not notes:
        return None
    updated = copy.deepcopy(original)
    updated["name"] = renamed
    append_notes(updated, notes)
    if updated == word:
        return None
    return updated


def replace_trans_value(span, new_trans):
    decoder = json.JSONDecoder()
    marker = re.search(r'"trans"\s*:', span)
    if not marker:
        return span
    cursor = marker.end()
    while cursor < len(span) and span[cursor] in " \t\r\n":
        cursor += 1
    _, end = decoder.raw_decode(span, cursor)
    original = span[cursor:end]
    if "\n" not in original:
        rendered = json.dumps(new_trans, ensure_ascii=False)
    else:
        item_indent = re.search(r"\n([ \t]+)\"", original)
        close_indent = re.search(r"\n([ \t]*)\]", original)
        if isinstance(new_trans, list) and item_indent and close_indent:
            lines = [json.dumps(item, ensure_ascii=False) for item in new_trans]
            body = (",\n" + item_indent.group(1)).join(lines)
            rendered = "[\n" + item_indent.group(1) + body + "\n" + close_indent.group(1) + "]"
        else:
            rendered = json.dumps(new_trans, ensure_ascii=False)
    return span[:cursor] + rendered + span[end:]


def replace_span(span, before, after):
    if "name" not in before and isinstance(after.get("name"), str):
        indent = re.search(r"\n([ \t]+)\"", span)
        pad = indent.group(1) if indent else "        "
        literal = json.dumps(after["name"], ensure_ascii=False)
        span = span.replace("{", '{\n' + pad + '"name": ' + literal + ",", 1)
    elif before.get("name") is False:
        span, count = re.subn(r'("name"\s*:\s*)false\b', r'\1"false"', span, count=1)
        if count != 1:
            raise ValueError(f"could not rewrite boolean name in {span[:80]!r}")
    elif before.get("name") != after.get("name"):
        old_literal = json.dumps(before["name"], ensure_ascii=False)
        new_literal = json.dumps(after["name"], ensure_ascii=False)
        pattern = r'("name"\s*:\s*)' + re.escape(old_literal)
        span, count = re.subn(pattern, r"\1" + new_literal, span, count=1)
        if count != 1:
            raise ValueError(f"could not rewrite name {before.get('name')!r}")
    if before.get("trans") != after.get("trans"):
        span = replace_trans_value(span, after["trans"])
    parsed = json.JSONDecoder().raw_decode(span)
    if parsed[0].get("name") != after.get("name") or parsed[0].get("trans") != after.get("trans"):
        raise ValueError(f"rewritten entry did not parse back to {after.get('name')!r}")
    return span


def rewrite_file(path, dry_run):
    raw = path.read_text(encoding="utf-8")
    newline = "\r\n" if "\r\n" in raw else "\n"
    decoder = json.JSONDecoder()
    changes = []
    pieces = []
    cursor = 0
    pos = raw.find("[") + 1
    while pos < len(raw):
        while pos < len(raw) and raw[pos] in " \t\r\n,":
            pos += 1
        if pos >= len(raw) or raw[pos] == "]":
            break
        word, end = decoder.raw_decode(raw, pos)
        updated = transform(word) if isinstance(word, dict) else None
        if updated is not None:
            pieces.append(raw[cursor:pos])
            pieces.append(replace_span(raw[pos:end], word, updated))
            cursor = end
            changes.append((word.get("name"), updated.get("name"), updated.get("trans")))
        pos = end
    if not changes:
        return []
    if not dry_run:
        rendered = "".join(pieces) + raw[cursor:]
        if newline == "\r\n":
            rendered = rendered.replace("\r\n", "\n").replace("\n", "\r\n")
        path.write_text(rendered, encoding="utf-8", newline="")
    return changes


def main():
    parser = argparse.ArgumentParser(description="Move alternate spellings out of English headwords.")
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing files.")
    args = parser.parse_args()
    total = 0
    for dict_id, url in english_dicts():
        path = ROOT / "public" / url.lstrip("/")
        if not path.exists():
            print(f"missing {dict_id} {url}")
            continue
        changes = rewrite_file(path, args.dry_run)
        for old, new, trans in changes:
            total += 1
            print(f"{dict_id}\t{old!r} => {new!r}\t{trans!r}")
    print(f"{total} headwords")


if __name__ == "__main__":
    main()
