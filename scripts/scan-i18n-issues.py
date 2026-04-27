#!/usr/bin/env python3
"""
i18n Issue Scanner — Comprehensive localization audit for SouqOne web app.
Detects:
  1. Raw governorate codes not wrapped in resolveLocationLabel
  2. Raw enum values displayed without translation (condition, partCategory, etc.)
  3. Hardcoded Arabic text in JSX that should use t() or tp() etc.
  4. Hardcoded English labels/buttons in JSX that should be localized
  5. Missing useLocale() when resolveLocationLabel/resolveCityLabel is used
"""

import os
import re
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # type: ignore
from dataclasses import dataclass, field
from typing import List, Optional

# ─── Configuration ────────────────────────────────────────────────────────────

SRC_ROOT = Path(__file__).parent.parent / "apps" / "web" / "src"

SKIP_DIRS = {
    ".next", "node_modules", "__pycache__", ".git",
    "generated", "prisma", "dist", "build",
}

SKIP_FILES = {
    "*.d.ts", "*.test.ts", "*.test.tsx", "*.spec.ts",
    "*.spec.tsx", "*.stories.tsx",
}

# Data-definition files that contain raw codes by design (not display bugs)
SKIP_DATA_FILES = {
    "location-data.ts",
    "constants.ts", "constants.tsx",
    "error-messages.ts",
    "specs.config.ts",
    "categories.config.ts",
    "filters.config.ts",
}

# Governorate codes
GOV_CODES = {
    "OM_MUS", "OM_DHO", "OM_DAK", "OM_BAN", "OM_BAS",
    "OM_SHN", "OM_SHS", "OM_DHA", "OM_BUR", "OM_MSN", "OM_WUS",
}

# Enum values that must be translated in UI
KNOWN_ENUMS = {
    # condition
    "NEW", "USED", "REFURBISHED",
    # partCategory
    "BATTERIES", "ENGINE", "BODY", "ELECTRICAL", "SUSPENSION",
    "BRAKES", "INTERIOR", "TIRES", "OILS", "OTHER",
    # serviceType
    "MAINTENANCE", "CLEANING", "MODIFICATION", "INSPECTION",
    "BODYWORK", "ACCESSORIES_INSTALL", "KEYS_LOCKS", "TOWING", "OTHER_SERVICE",
    # providerType
    "WORKSHOP", "INDIVIDUAL", "MOBILE", "COMPANY",
    # listingType
    "SALE", "RENTAL",
    # busListingType
    "BUS_SALE", "BUS_RENT", "BUS_CONTRACT", "BUS_REQUEST", "BUS_SALE_WITH_CONTRACT",
    # equipmentType
    "EQUIPMENT_SALE", "EQUIPMENT_RENT",
    # status
    "ACTIVE", "EXPIRED", "CLOSED", "PENDING", "SUSPENDED",
    # jobType / employmentType
    "FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE",
    "HEAVY", "LIGHT", "TRANSPORT", "BUS", "MOTORCYCLE",
    # insurance
    "CAR_COMPREHENSIVE", "CAR_THIRD_PARTY", "MARINE", "HEAVY_EQUIPMENT", "FINANCING", "LEASING",
}

# Patterns that indicate the value IS already being resolved/translated
SAFE_WRAPPERS = [
    # Location resolvers
    "resolveLocationLabel", "resolveCityLabel", "resolveOmanLocationLabels",
    "getGovernorates", "getCities", "getGovernorateLabel", "getCityLabel",
    # Translation functions
    "t(", "tp(", "ts(", "tm(", "tj(", "tt(", "tl(", "useTranslations",
    # Enum translators
    "translatePartCategory", "translateServiceType", "translateProvider",
    "getConditionBadge", "getListingTypeBadge", "getBusTypeLabel",
    "condLabel", "conditionLabel", "typeLabel",
    "ENUM_VALUE_KEY_MAP", "enumLabels",
    # Local label maps (Arabic-only, warn separately)
    "OPERATOR_TYPE_LABELS", "LICENSE_LABELS", "VEHICLE_LABELS",
    "LANG_LABELS", "EQUIP_TYPE_LABELS", "TYPE_LABELS", "PART_CAT_AR",
    "SVC_TYPE_AR", "BUS_TYPE_LABELS", "empLabels", "conditionMap",
    "PART_COND_AR", "conditionColorMap", "getListingTypeLabel",
    "ListingBadge", "getBadge", "badge",
]

# Patterns for data/logic (not display) — skip these
NON_DISPLAY_PATTERNS = [
    r"^\s*(const|let|var)\s",                  # variable declarations
    r"=\s*['\"]",                               # assignment to string
    r"\.(governorate|condition|city)\s*[=!<>]", # comparisons
    r"filter\(|find\(|some\(|every\(",         # array methods
    r"params\.|query\.|body\.|dto\.",           # API/params
    r"formData|setForm|updateField|set\(",      # form handlers
    r"if\s*\(|&&\s*$|\|\|\s*$",               # conditionals
    r"governorate:\s*raw\.|\.governorate\s*\??\s*[,\)]",  # object props
    r"normalizeSeller|normalizePlaceKey",       # data functions
    r"addToast|toast\.",                        # toast messages
    r"type\s+\w+\s*=|interface\s+\w+",        # type definitions
    r"\.map\s*\(|\.filter\s*\(",              # data transforms
    r"value=\{|defaultValue=\{|onChange=\{",  # form inputs
    r"href=|src=|className=|style=",           # HTML attributes
    r"import\s+|export\s+",                    # imports/exports
    r"//|/\*|\*",                              # comments
    r"console\.",                              # console logs
    r"useState|useEffect|useMemo|useCallback",  # hooks
    r"key=\{|id=\{|data-",                    # React keys/attributes
    r"router\.|navigate\(",                    # routing
    r"@/|from '|require\(",                   # imports
]

# JSX display patterns to check (lines likely rendering text to UI)
JSX_DISPLAY_RE = re.compile(
    r"""
    \{                          # opening brace
    (?!.*(?:                    # NOT followed by safe wrappers (lookahead)
        resolveLocationLabel|resolveCityLabel|resolveOmanLocationLabels|
        getGovernorates|getCities|getGovernorateLabel|
        t\(|tp\(|ts\(|tm\(|tj\(|tt\(|tl\(|
        translatePartCategory|translateServiceType|translateProvider|
        getConditionBadge|getListingTypeBadge|ENUM_VALUE_KEY_MAP|
        LICENSE_LABELS|VEHICLE_LABELS|LANG_LABELS|EQUIP_TYPE_LABELS|
        OPERATOR_TYPE_LABELS
    ))
    [^{}]*?\.(?:governorate|condition|partCategory|serviceType|providerType|listingType|busListingType|status|employmentType|jobType)
    [^{}]*?
    \}
    """,
    re.VERBOSE,
)

# Governorate code displayed raw
GOV_CODE_RE = re.compile(
    r'\{[^{}]*\b(OM_(?:MUS|DHO|DAK|BAN|BAS|SHN|SHS|DHA|BUR|MSN|WUS))\b[^{}]*\}'
)

# Pattern: hardcoded Arabic text directly in JSX (between tags, not in {})
ARABIC_JSX_RE = re.compile(
    r'(?<=>)([^<{}\n]*[\u0600-\u06FF][^<{}\n]*)(?=<|$)'
)

# Pattern: hardcoded English text in JSX (button labels, headings, etc.)
ENGLISH_LABEL_RE = re.compile(
    r'(?<=>)(\s*[A-Za-z][A-Za-z\s\-\']{4,40}\s*)(?=<)'
)

# Arabic text in JSX attributes (like placeholder, aria-label without t())
ARABIC_ATTR_RE = re.compile(
    r'(?:placeholder|aria-label|title|alt|label)=["\']([^"\']*[\u0600-\u06FF][^"\']*)["\']'
)

# ─── Issue dataclass ──────────────────────────────────────────────────────────

@dataclass
class Issue:
    category: str
    line_no: int
    line: str
    detail: str = ""

# ─── Helpers ──────────────────────────────────────────────────────────────────

def is_non_display_line(line: str) -> bool:
    """Returns True if this line is clearly not a JSX display context."""
    stripped = line.strip()
    for pat in NON_DISPLAY_PATTERNS:
        if re.search(pat, stripped):
            return True
    return False


def has_safe_wrapper(line: str) -> bool:
    """Returns True if any safe wrapper is present on the line."""
    return any(w in line for w in SAFE_WRAPPERS)


def is_in_jsx_context(line: str) -> bool:
    """Heuristic: line looks like JSX/TSX rendering code."""
    stripped = line.strip()
    return (
        stripped.startswith("<") or
        stripped.startswith("{") or
        ("<" in stripped and ">" in stripped and not stripped.startswith("import")) or
        (stripped.startswith("return") and "<" in stripped) or
        "className=" in stripped or
        "style=" not in stripped and stripped.endswith("/>") or
        stripped.endswith(">") or
        stripped.endswith("}") and "</" in stripped
    )


def line_has_arabic(line: str) -> bool:
    return bool(re.search(r'[\u0600-\u06FF]', line))


def extract_jsx_string_literals(line: str) -> List[str]:
    """Find JSX text content between tags (not in braces)."""
    results = []
    for m in ARABIC_JSX_RE.finditer(line):
        text = m.group(1).strip()
        if len(text) >= 2 and re.search(r'[\u0600-\u06FF]', text):
            results.append(text)
    return results


def extract_english_jsx_labels(line: str) -> List[str]:
    """Find English label text between JSX tags."""
    results = []
    for m in ENGLISH_LABEL_RE.finditer(line):
        text = m.group(1).strip()
        # Skip common non-label English in JSX
        if (len(text) >= 5 and
            not text.startswith("http") and
            not re.match(r'^[A-Z_]{3,}$', text) and  # skip ALL_CAPS enums
            not re.match(r'^\d', text)):
            results.append(text)
    return results


def scan_file(filepath: Path) -> List[Issue]:
    issues: List[Issue] = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return issues

    lines = content.splitlines()
    in_comment_block = False

    for i, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Track block comments
        if "/*" in stripped:
            in_comment_block = True
        if "*/" in stripped:
            in_comment_block = False
            continue
        if in_comment_block:
            continue

        # Skip single-line comments
        if stripped.startswith("//") or stripped.startswith("*"):
            continue

        # Skip import/export/type lines
        if re.match(r'^\s*(import|export|type|interface|const\s+\w+\s*[:=]\s*[{\[])', line):
            continue

        # ── 1. Raw Governorate Codes ──────────────────────────────────────────
        for code in GOV_CODES:
            # Check if a gov code appears as a string literal in JSX
            if f'"{code}"' in line or f"'{code}'" in line:
                if not has_safe_wrapper(line) and not is_non_display_line(line):
                    issues.append(Issue(
                        "🔴 RAW_GOV_CODE",
                        i, stripped,
                        f"Literal governorate code: {code}"
                    ))

        # ── 2. Raw .governorate access in JSX without wrapper ─────────────────
        if ".governorate" in line and not has_safe_wrapper(line):
            if not is_non_display_line(line):
                # Is it being displayed (inside JSX curly — not as a prop={})
                # Prop-passing: governorate={item.governorate} is NOT a raw display
                # because the child component resolves it internally
                # Only flag if it's rendered as visible TEXT (e.g., {item.governorate})
                gov_match = re.search(r'\{[^{}]*\.governorate[^{}]*\}', line)
                is_prop = re.search(r'\w+=\{[^{}]*\.governorate[^{}]*\}', line)
                if gov_match and not is_prop:
                    issues.append(Issue(
                        "🔴 RAW_GOV_DISPLAY",
                        i, stripped,
                        ".governorate rendered as text without resolveLocationLabel"
                    ))

        # ── 3. Raw Enum Values in JSX ─────────────────────────────────────────
        if not has_safe_wrapper(line) and not is_non_display_line(line):
            # Check for enum values displayed as string literals in JSX
            for enum_val in KNOWN_ENUMS:
                # Pattern: enum value as a JSX string literal between tags or in {}
                if (f'"{enum_val}"' in line or f"'{enum_val}'" in line or
                        f'`{enum_val}`' in line):
                    # But NOT in conditions/comparisons
                    if not re.search(rf"[=!<>]\s*['\"`]{enum_val}['\"`]|['\"`]{enum_val}['\"`]\s*[=!<>]", line):
                        if re.search(r'[>}]\s*' + re.escape(f'"{enum_val}"') + r'|' +
                                     re.escape(f'"{enum_val}"') + r'\s*[<{]', line):
                            issues.append(Issue(
                                "🟡 RAW_ENUM_LITERAL",
                                i, stripped,
                                f'Enum literal "{enum_val}" displayed without translation'
                            ))

        # ── 4. .condition / .status / .partCategory etc. in JSX without wrapper ──
        ENUM_FIELDS = [
            "condition", "partCategory", "serviceType", "providerType",
            "listingType", "busListingType", "employmentType", "jobType",
        ]
        if not has_safe_wrapper(line) and not is_non_display_line(line):
            for ef in ENUM_FIELDS:
                if f".{ef}" in line:
                    if re.search(r'\{[^{}]*\.' + ef + r'[^{}]*\}', line):
                        issues.append(Issue(
                            "🟡 RAW_ENUM_FIELD",
                            i, stripped,
                            f".{ef} displayed in JSX without enum translation"
                        ))

        # ── 5. Hardcoded Arabic text in JSX (not inside t() etc.) ─────────────
        if line_has_arabic(line) and not has_safe_wrapper(line):
            # Skip certain patterns
            if not re.search(r'(//|/\*|\*|import|export|console\.)', stripped):
                # Skip lines that are pure logic
                if not is_non_display_line(line):
                    arabic_texts = extract_jsx_string_literals(line)
                    for text in arabic_texts:
                        # Skip very short fragments or known-ok patterns
                        if len(text.strip()) >= 3:
                            issues.append(Issue(
                                "🟠 HARDCODED_ARABIC",
                                i, stripped,
                                f'Hardcoded Arabic: "{text.strip()[:60]}"'
                            ))

            # Check Arabic in HTML attributes (placeholder, aria-label, etc.)
            for m in ARABIC_ATTR_RE.finditer(line):
                attr_val = m.group(1)
                if len(attr_val) >= 3:
                    issues.append(Issue(
                        "🟠 HARDCODED_ARABIC_ATTR",
                        i, stripped,
                        f'Arabic in attribute: "{attr_val[:60]}"'
                    ))

        # ── 6. resolveLocationLabel called but no useLocale ───────────────────
        # (Checked at file level below)

    # ── 7. File-level: resolveLocationLabel used but useLocale not declared ──
    if ("resolveLocationLabel" in content or "resolveCityLabel" in content):
        if "useLocale" not in content:
            issues.insert(0, Issue(
                "🔴 MISSING_USE_LOCALE",
                0,
                "(file level)",
                "resolveLocationLabel/resolveCityLabel used but useLocale() not imported/called"
            ))

    return issues


# ─── Report printer ───────────────────────────────────────────────────────────

CATEGORY_PRIORITY = {
    "🔴 MISSING_USE_LOCALE": 0,
    "🔴 RAW_GOV_CODE":       1,
    "🔴 RAW_GOV_DISPLAY":    2,
    "🟡 RAW_ENUM_FIELD":     3,
    "🟡 RAW_ENUM_LITERAL":   4,
    "🟠 HARDCODED_ARABIC":   5,
    "🟠 HARDCODED_ARABIC_ATTR": 6,
}


def main():
    if not SRC_ROOT.exists():
        print(f"❌ Source directory not found: {SRC_ROOT}")
        sys.exit(1)

    print(f"\n{'='*70}")
    print(f"  🔍 i18n Issue Scanner — {SRC_ROOT}")
    print(f"{'='*70}\n")

    total_issues = 0
    file_count = 0
    category_counts: dict = {}
    report_lines: List[str] = []

    for root, dirs, files in os.walk(SRC_ROOT):
        # Skip unwanted dirs
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        root_path = Path(root)

        for fname in files:
            if not (fname.endswith(".tsx") or fname.endswith(".ts")):
                continue
            # Skip test/story files
            if any(fname.endswith(p.lstrip("*")) for p in SKIP_FILES):
                continue
            # Skip data-definition files (raw values are intentional)
            if fname in SKIP_DATA_FILES:
                continue

            fpath = root_path / fname
            rel = fpath.relative_to(SRC_ROOT)

            issues = scan_file(fpath)
            if not issues:
                continue

            # Sort by priority then line
            issues.sort(key=lambda x: (CATEGORY_PRIORITY.get(x.category, 99), x.line_no))

            file_count += 1
            total_issues += len(issues)
            report_lines.append(f"\n📁 {rel}")

            for iss in issues:
                category_counts[iss.category] = category_counts.get(iss.category, 0) + 1
                loc = f"L{iss.line_no}" if iss.line_no > 0 else "FILE"
                report_lines.append(f"   {iss.category} [{loc}]")
                report_lines.append(f"      → {iss.detail}")
                if iss.line_no > 0 and iss.line:
                    snippet = iss.line[:120]
                    report_lines.append(f"      ┊ {snippet}")

    # Print report
    for line in report_lines:
        print(line)

    # Summary
    print(f"\n{'='*70}")
    print(f"  📊 SUMMARY")
    print(f"{'='*70}")
    print(f"  Files with issues : {file_count}")
    print(f"  Total issues      : {total_issues}")
    print()
    for cat, count in sorted(category_counts.items(), key=lambda x: CATEGORY_PRIORITY.get(x[0], 99)):
        print(f"  {cat:<35} → {count:>3} occurrence(s)")

    print(f"\n{'='*70}")

    if total_issues == 0:
        print("  ✅ No i18n issues found!")
    else:
        print(f"  ⚠️  {total_issues} potential i18n issue(s) found in {file_count} file(s)")

    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
