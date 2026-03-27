import json
import re

def is_mostly_english(text):
    if not isinstance(text, str): return False
    # Check if more than 50% of characters are latin
    latin_chars = len(re.findall(r'[a-zA-Z]', text))
    total_chars = len(text.strip())
    if total_chars == 0: return True # Consider empty as missing
    return (latin_chars / total_chars) > 0.5 if total_chars > 0 else False

def audit_locale(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues = []
    
    def check_dict(d, prefix=''):
        for k, v in d.items():
            full_key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                check_dict(v, full_key)
            else:
                if not v or is_mostly_english(v):
                    # Some keys are meant to be English (e.g. brand names, "MIN", "PTZ")
                    # but if it's a long sentence, it's likely an issue
                    if len(v) > 3 or not v:
                        issues.append((full_key, v))
    
    check_dict(data)
    return issues

if __name__ == "__main__":
    ar_issues = audit_locale(r'e:\web dev\mevn\el_mowared\client\src\locales\ar.json')
    print("Issues in ar.json (Empty or English values):")
    for k, v in ar_issues:
        print(f"  - {k}: '{v}'")
