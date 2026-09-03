#!/bin/bash
# QA API runner — emits PASS/FAIL per test case against the live dev server.
QEMAIL=qa$(date +%s)@test.io
API=http://localhost:5000/api/v1
J='Content-Type: application/json'
PASS=0; FAIL=0
check(){ if [ "$1" = "$2" ]; then echo "PASS $3"; PASS=$((PASS+1)); else echo "FAIL $3 (expected=$2 got=$1)"; FAIL=$((FAIL+1)); fi; }
parse(){ node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(eval(process.argv[1]))}catch(e){console.log('')}})" "$1"; }
code(){ curl -s -o /tmp/qa_body -w "%{http_code}" "$@"; }

echo "=== AUTH ==="
c=$(code -X POST $API/auth/register -H "$J" -d "{\"name\":\"QA Student\",\"email\":\"${QEMAIL}\",\"password\":\"Password123!\"}")
check "$c" 201 "AUTH-01 register valid"
TOKEN=$(cat /tmp/qa_body | parse "j.token")
check "$(cat /tmp/qa_body | parse "j.user.plan")" "free" "AUTH-01b plan=free"
c=$(code -X POST $API/auth/register -H "$J" -d "{\"name\":\"Dup\",\"email\":\"${QEMAIL}\",\"password\":\"Password123!\"}")
check "$c" 409 "AUTH-02 duplicate email"
c=$(code -X POST $API/auth/register -H "$J" -d '{"name":"Bad","email":"bad@test.io","password":"short"}')
check "$c" 400 "AUTH-03 short password"
c=$(code -X POST $API/auth/login -H "$J" -d "{\"email\":\"${QEMAIL}\",\"password\":\"Password123!\"}")
check "$c" 200 "AUTH-04 login valid"
REFRESH=$(cat /tmp/qa_body | parse "j.refreshToken")
c=$(code -X POST $API/auth/login -H "$J" -d "{\"email\":\"${QEMAIL}\",\"password\":\"wrong\"}")
check "$c" 401 "AUTH-05 wrong password"
c=$(code -X POST $API/auth/refresh -H "$J" -d "{\"refreshToken\":\"$REFRESH\"}")
check "$c" 200 "AUTH-07 refresh rotates"
TAMPERED="${TOKEN%?}x"
c=$(code $API/student/me -H "Authorization: Bearer $TAMPERED")
check "$c" 401 "AUTH-08 tampered token"

echo "=== ADMIN login ==="
c=$(code -X POST $API/auth/login -H "$J" -d '{"email":"admin@example.com","password":"Admin1234!"}')
check "$c" 200 "ADMIN login"
ATOKEN=$(cat /tmp/qa_body | parse "j.token")

echo "=== RBAC ==="
c=$(code $API/admin/users -H "Authorization: Bearer $TOKEN")
check "$c" 403 "RBAC-01 student blocked from admin"
c=$(code $API/admin/users -H "Authorization: Bearer $ATOKEN")
check "$c" 200 "RBAC-02 admin allowed"
c=$(code $API/student/me)
check "$c" 401 "RBAC-03 no token"

echo "=== DIAGNOSTIC ==="
c=$(code -X POST $API/student/diagnostic/start -H "Authorization: Bearer $TOKEN")
check "$c" 200 "DIAG-01 start"
check "$(cat /tmp/qa_body | parse "j.question.correctIndex === undefined")" "true" "DIAG-01b correctIndex hidden"
D1=$(cat /tmp/qa_body | parse "j.question.difficulty")
for i in 1 2 3 4 5 6 7 8 9 10; do
  c=$(code -X POST $API/student/diagnostic/answer -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"selectedIndex":1}')
  DONE=$(cat /tmp/qa_body | parse "j.completed")
  [ "$DONE" = "true" ] && break
done
check "$DONE" "true" "DIAG-03 completes"
check "$(curl -s $API/student/matrix -H "Authorization: Bearer $TOKEN" | parse "Object.keys(j.domains).length >= 2")" "true" "DIAG-03b matrix populated"
check "$(curl -s $API/student/matrix -H "Authorization: Bearer $TOKEN" | parse "j.diagnosticStatus")" "complete" "DIAG-03c status complete"

echo "=== LESSONS ==="
c=$(code $API/lessons -H "Authorization: Bearer $TOKEN")
check "$c" 200 "LESS-01 list"
check "$(cat /tmp/qa_body | parse "j.lessons.length")" "4" "LESS-01b catalog size"
L=$(curl -s $API/lessons/oop-basics -H "Authorization: Bearer $TOKEN")
echo "$L" | parse "j.adaptation.used" | grep -qE "true|false" && check "ok" "ok" "LESS-02/03 fetch with adaptation flag" || check "bad" "ok" "LESS-02/03"

echo "=== CODE ==="
c=$(code $API/submissions/exercises -H "Authorization: Bearer $TOKEN")
check "$c" 200 "CODE-01 exercises"
check "$(cat /tmp/qa_body | parse "j.exercises.length")" "4" "CODE-01b count"
c=$(code -X POST $API/submissions -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"exerciseId":"sum-array","code":"function sumArray(arr){ let total=0; for (const n of arr) total+=n; if(arr.length===0) return 0; return total; }","language":"javascript"}')
check "$c" 201 "CODE-02 submit"
check "$(cat /tmp/qa_body | parse "Object.keys(j.evaluation.scores).length")" "4" "CODE-02b four dimensions"
SUBID=$(cat /tmp/qa_body | parse "j.submissionId")
c=$(code -X POST $API/submissions -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"exerciseId":"nope","code":"x","language":"javascript"}')
check "$c" 404 "CODE-05 unknown exercise"

echo "=== RBAC ownership ==="
c=$(code -X POST $API/auth/register -H "$J" -d '{"name":"Other","email":"other2@test.io","password":"Password123!"}')
OTOKEN=$(cat /tmp/qa_body | parse "j.token")
c=$(code $API/submissions/$SUBID/feedback -H "Authorization: Bearer $OTOKEN")
check "$c" 403 "RBAC-04 cross-user feedback blocked"
c=$(code $API/submissions/$SUBID/feedback -H "Authorization: Bearer $TOKEN")
check "$c" 200 "RBAC-05 own feedback"

echo "=== CHAT ==="
c=$(code -X POST $API/chat -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"message":"What is recursion?"}')
check "$c" 201 "CHAT-01 domain question"
check "$(cat /tmp/qa_body | parse "j.reply.content.length>0")" "true" "CHAT-01b content non-empty"
SRC=$(cat /tmp/qa_body | parse "j.source"); echo "   [chat source: $SRC, degraded: $(cat /tmp/qa_body | parse "j.degraded")]"
c=$(code -X POST $API/chat -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"message":"quantum physics"}')
check "$c" 201 "CHAT-02 off-topic"
check "$(curl -s $API/chat/history -H "Authorization: Bearer $TOKEN" | parse "Array.isArray(j.messages)")" "true" "CHAT-03 own history reachable"
check "$(curl -s $API/chat/history -H "Authorization: Bearer $OTOKEN" | parse "j.messages.length")" "0" "CHAT-04 isolation"
c=$(code -X POST $API/chat -H "$J" -d '{"message":"hi"}')
check "$c" 401 "CHAT-05 unauthenticated"
c=$(code -X DELETE $API/chat/history -H "Authorization: Bearer $TOKEN")
check "$c" 200 "CHAT-06 clear"

echo "=== PREMIUM ==="
c=$(code $API/premium/memory -H "Authorization: Bearer $TOKEN")
check "$c" 402 "PREM-01 memory gated 402"
check "$(cat /tmp/qa_body | parse "j.error.code")" "PREMIUM_REQUIRED" "PREM-01b code"
check "$(curl -s $API/premium/dna -H "Authorization: Bearer $TOKEN" | parse "j.locked")" "true" "PREM-02 dna teaser locked"
c=$(code -X POST $API/premium/upgrade -H "Authorization: Bearer $TOKEN" -H "$J" -d '{"plan":"premium"}')
check "$c" 200 "PREM-03 upgrade"
PTOKEN=$(cat /tmp/qa_body | parse "j.token")
check "$(cat /tmp/qa_body | parse "j.user.plan")" "premium" "PREM-03b plan claim"
c=$(code -X POST $API/premium/upgrade -H "Authorization: Bearer $PTOKEN" -H "$J" -d '{"plan":"premium"}')
check "$c" 409 "PREM-04 double upgrade"
c=$(code $API/premium/memory -H "Authorization: Bearer $PTOKEN")
check "$c" 200 "PREM-05 memory unlocked"
check "$(cat /tmp/qa_body | parse "j.domains.length >= 1 && j.domains[0].forecast.length")" "15" "PREM-05b 15-point forecast"
c=$(code -X POST $API/premium/memory/rescue -H "Authorization: Bearer $PTOKEN")
check "$c" 200 "PREM-06 rescue start"
code -X POST $API/premium/memory/rescue/answer -H "Authorization: Bearer $PTOKEN" -H "$J" -d '{"selectedIndex":0}' > /dev/null
c=$(code -X POST $API/premium/memory/rescue/answer -H "Authorization: Bearer $PTOKEN" -H "$J" -d '{"selectedIndex":0}')
check "$(cat /tmp/qa_body | parse "j.completed")" "true" "PREM-06b rescue completes"
check "$(cat /tmp/qa_body | parse "j.stabilityDays > 0")" "true" "PREM-06c stability"
check "$(curl -s $API/premium/dna -H "Authorization: Bearer $PTOKEN" | parse "j.locked === false && j.axes.length")" "4" "PREM-07 dna full"

echo "=== ADMIN ==="
check "$(curl -s $API/admin/analytics -H "Authorization: Bearer $ATOKEN" | parse "j.users.students >= 2")" "true" "ADMIN-05 analytics"
check "$(curl -s $API/admin/audit-log -H "Authorization: Bearer $ATOKEN" | parse "j.entries.length >= 0")" "true" "ADMIN-06 audit log reachable"
QID=$(curl -s "$API/admin/users" -H "Authorization: Bearer $ATOKEN" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.users.find(u=>u.email==='${QEMAIL}').id)})")
c=$(code -X PATCH $API/admin/users/$QID -H "Authorization: Bearer $ATOKEN" -H "$J" -d '{"status":"suspended"}')
check "$c" 200 "ADMIN-03 suspend"
c=$(code -X POST $API/auth/login -H "$J" -d "{\"email\":\"${QEMAIL}\",\"password\":\"Password123!\"}")
check "$c" 403 "ADMIN-03b suspended login blocked"
check "$(curl -s $API/admin/audit-log -H "Authorization: Bearer $ATOKEN" | parse "j.entries.some(e=>e.action==='user.update')")" "true" "ADMIN-06b action audited"

echo "=== NFR ==="
check "$(curl -s $API/health | parse "j.status")" "ok" "NFR-01 health"

echo ""
echo "RESULT: $PASS passed, $FAIL failed"
