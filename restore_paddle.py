import os

file_path = 'tools/program.py'

if os.path.exists(file_path):
    print(f"🔧 Repairing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The Logic: Find the invalid syntax and replace it with valid assignment
    bad_syntax = "config['Global'].get('profiler_options', None) = None"
    good_syntax = "config['Global']['profiler_options'] = None"
    
    # Also fix double quotes version just in case
    bad_syntax_2 = 'config["Global"].get("profiler_options", None) = None'
    
    if bad_syntax in content:
        new_content = content.replace(bad_syntax, good_syntax)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✅ Success: Syntax error repaired.")
    elif bad_syntax_2 in content:
        new_content = content.replace(bad_syntax_2, good_syntax)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✅ Success: Syntax error repaired.")
    else:
        print("ℹ️ No syntax error found (or it looks different). Check Line 89 manually.")
else:
    print(f"❌ Could not find {file_path}")