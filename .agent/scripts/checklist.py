
import os
import sys
import subprocess
import re

def run_command(command, cwd=None):
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            text=True,
            capture_output=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_lint():
    print("🔍 Checking Linting...")
    # Frontend Lint
    if os.path.exists("package.json"):
        success, out, err = run_command("npm run lint")
        if success:
            print("✅ Frontend Lint passed")
            return True
        else:
            print("❌ Frontend Lint failed")
            print(out)
            return False
    return True

def check_purple_ban():
    print("🔍 Checking Purple Ban (Design Rules)...")
    purple_patterns = [
        r'#([89A-Fa-f])\w([0-9A-Fa-f])\w([89A-Fa-f])\w', # Rough heuristic for hex
        r'purple-', r'violet-', r'indigo-', r'fuchsia-'
    ]
    
    # Simple scan of src files
    violations = []
    for root, dirs, files in os.walk("src"):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.js', '.jsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for pattern in purple_patterns:
                            if re.search(pattern, content):
                                # Skip Shadcn default files if necessary, but generally flag
                                violations.append(f"{path}: matches {pattern}")
                except:
                    continue
    
    if violations:
        print("⚠️  Potential Purple/Violet usage detected (Verify if allowed):")
        for v in violations[:5]:
            print(f"   - {v}")
        if len(violations) > 5: print(f"   ...and {len(violations)-5} more")
        return True # Soft fail/Warning
    
    print("✅ No explicit purple keywords found")
    return True

def main():
    print("🚀 Starting Project Checklist...")
    
    checks = [
        check_lint,
        check_purple_ban
        # Add more checks here
    ]
    
    all_passed = True
    for check in checks:
        if not check():
            all_passed = False
            
    if all_passed:
        print("\n✅ ALL CHECKS PASSED")
        sys.exit(0)
    else:
        print("\n❌ SOME CHECKS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
