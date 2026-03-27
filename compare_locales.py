import json
import os

def get_keys(data, prefix=''):
    keys = set()
    if isinstance(data, dict):
        for k, v in data.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            if not isinstance(v, dict):
                keys.add(new_prefix)
            else:
                keys.update(get_keys(v, new_prefix))
    return keys

def compare_locales(file1, file2):
    try:
        with open(file1, 'r', encoding='utf-8') as f:
            data1 = json.load(f)
        with open(file2, 'r', encoding='utf-8') as f:
            data2 = json.load(f)

        keys1 = get_keys(data1)
        keys2 = get_keys(data2)

        only_in_1 = sorted(list(keys1 - keys2))
        only_in_2 = sorted(list(keys2 - keys1))

        print(f"Keys only in {os.path.basename(file1)}:")
        for k in only_in_1:
            print(f"  - {k}")
        
        print(f"\nKeys only in {os.path.basename(file2)}:")
        for k in only_in_2:
            print(f"  - {k}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    compare_locales(r'e:\web dev\mevn\el_mowared\client\src\locales\en.json', r'e:\web dev\mevn\el_mowared\client\src\locales\ar.json')
