import os

def patch_file(file_path):
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        return

    print(f"🔧 Patching {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The Logic: Replace unsafe dictionary access with safe .get() method
    # This prevents the KeyError: 'profiler_options' crash
    original_code_1 = "config['Global']['profiler_options']"
    patched_code_1 = "config['Global'].get('profiler_options', None)"
    
    original_code_2 = 'config["Global"]["profiler_options"]'
    patched_code_2 = 'config["Global"].get("profiler_options", None)'

    if original_code_1 in content or original_code_2 in content:
        new_content = content.replace(original_code_1, patched_code_1)
        new_content = new_content.replace(original_code_2, patched_code_2)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Successfully fixed 'profiler_options' bug in {file_path}")
    else:
        print(f"ℹ️ No 'profiler_options' bug found in {file_path} (or already fixed).")

# Apply the patch to both critical files
patch_file('tools/program.py')
patch_file('tools/train.py')