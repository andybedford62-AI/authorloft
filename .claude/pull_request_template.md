# 📌 Pull Request Summary
<!-- Describe what this PR does and why -->
- What problem does this solve?
- High-level approach:
- Related issue(s): #

---

# 📋 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Performance improvement
- [ ] Security fix
- [ ] Documentation update

---

# ✅ Code Review Checklist

## 🔍 Scope
- [ ] PR is focused (does one thing)
- [ ] No unrelated changes mixed in
- [ ] PR size is reasonable (not too large)

## ✅ Functionality & Correctness
- [ ] Code meets requirements / acceptance criteria
- [ ] Edge cases handled (null, empty, errors, etc.)
- [ ] Proper error handling implemented
- [ ] No obvious logic bugs

## 🧪 Testing
- [ ] Unit/integration tests added or updated
- [ ] Tests cover edge cases and failure scenarios
- [ ] All tests pass
- [ ] No skipped or disabled tests

## 📖 Readability & Maintainability
- [ ] Code is easy to understand
- [ ] Naming is clear and meaningful
- [ ] No unnecessary complexity
- [ ] Comments explain *why* (not obvious code)
- [ ] No duplicate code

## 🧩 Design & Architecture
- [ ] Follows project architecture and patterns
- [ ] Code is modular and reusable
- [ ] No unnecessary dependencies introduced

## 🔐 Security
- [ ] Input validation handled properly
- [ ] Authentication & authorization enforced
- [ ] No secrets (keys/tokens/passwords) in code
- [ ] No common vulnerabilities (e.g., SQL injection, XSS)

## ⚡ Performance
- [ ] No inefficient loops or queries
- [ ] No N+1 query issues
- [ ] Heavy tasks handled appropriately (async/background)
- [ ] Scales reasonably under load

## 🔄 Dependencies & Side Effects
- [ ] External calls handled safely (timeouts/retries)
- [ ] No unintended side effects
- [ ] Dependencies justified and secure

## 🚀 Deployment / Operations
- [ ] Feature flags added (if needed)
- [ ] Logs/metrics added for new behavior
- [ ] DB migrations safe (if applicable)
- [ ] Documentation updated

---

# 🧠 Reviewer Notes
<!-- Call out areas needing focused review -->
- Risky areas:
- Anything reviewers should pay attention to:

---

# ✅ Approval Guidelines
- ✅ Approve: All critical items checked
- ❌ Request changes: Any blocker remains
- 💬 Comment: Suggestions only (no blockers)
