import json
import re
import sys

payload = json.load(sys.stdin)
command = payload.get("tool_input", {}).get("command", "")

blocked_patterns = [
    r"\brm\s+-[^\n;]*r[^\n;]*f\b",
    r"\bgit\s+reset\s+--hard\b",
    r"\bgit\s+clean\s+-",
    r"\bgit\s+push\b.*\s--force\b",
    r"\bgit\s+branch\s+-D\b",
    r"\bsudo\b",
    r"\bcurl\b.*\|\s*(sh|bash)\b",
    r"\bwget\b.*\|\s*(sh|bash)\b",
    r"\bdocker\s+(system|volume)\s+prune\b",
    r"\bkubectl\s+delete\b",
    r"\b(drop\s+database|drop\s+table|truncate\s+table)\b",
    r"\bdel\s+/.+[sq]\b",
    r"\brd\s+/s\b",
    r"\bRemove-Item\b.*\b-Recurse\b",
    r"\bformat\b",
    r"\bdd\s+if=",
    r"\bmkfs\b",
]

matched = next((pattern for pattern in blocked_patterns if re.search(pattern, command, re.IGNORECASE)), None)

if matched:
    decision = "deny"
    reason = f"Blocked high-risk Bash command by local safety hook: {matched}"
else:
    decision = "allow"
    reason = "Allowed by local Bash safety hook"

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": decision,
        "permissionDecisionReason": reason,
    }
}, ensure_ascii=False))
