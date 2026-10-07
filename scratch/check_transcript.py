import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\niron\.gemini\antigravity-ide\brain\dcab6c46-0def-4589-98ea-988fe883a34b\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        d = json.loads(line)
        idx = d.get('step_index', 0)
        if 760 <= idx <= 775:
            print(f"--- STEP {idx} ({d.get('type')}) ---")
            if d.get('tool_calls'):
                for tc in d['tool_calls']:
                    print(f"Tool: {tc.get('name')}, args: {str(tc.get('args'))[:200]}")
            if d.get('content'):
                print("Content:", d['content'][:300])
