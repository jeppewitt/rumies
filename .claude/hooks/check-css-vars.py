#!/usr/bin/env python3
"""
Post-edit hook: tjekker at alle var(--x) referencer i en HTML-fil
er defineret i filens :root block.
"""
import sys, json, re, os

def check_file(path):
    if not path.endswith('.html'):
        return []
    try:
        content = open(path, encoding='utf-8').read()
    except Exception:
        return []

    # Alle definerede CSS-variabler i filen (uanset selector)
    defined = set(re.findall(r'(--[\w-]+)\s*:', content))

    # Alle brugte var(--x)
    used = set(re.findall(r'var\((--[\w-]+)', content))

    undefined = used - defined
    if undefined:
        name = os.path.basename(path)
        vars_list = ', '.join(sorted(undefined))
        print(f"⚠️  {name}: udefinerede CSS-variabler: {vars_list}")
        return undefined
    return []

try:
    data = json.load(sys.stdin)
    path = data.get('tool_input', {}).get('file_path', '')
    if path:
        issues = check_file(path)
        if issues:
            sys.exit(1)
except Exception:
    pass
