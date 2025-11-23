# API 使用指南

## 问题说明

您遇到的 **401 Unauthorized** 错误是因为使用了错误的认证 cookies。

### 您的 curl 命令中的问题

您的 curl 命令包含了来自 **Clerk** 认证系统的 cookies：
- `__clerk_db_jwt`
- `__session` (Clerk 的 JWT token)

**但本项目使用的是 NextAuth.js，不是 Clerk！**

---

## ✅ 正确的 API 调用方式

### 方法 1: 使用测试脚本（推荐）

```bash
chmod +x test-api.sh
./test-api.sh
```

这个脚本会自动：
1. 获取 CSRF token
2. 登录获取 session
3. 测试所有 API 端点

### 方法 2: 手动 curl 命令

```bash
# Step 1: 获取 CSRF token 并保存 cookies
curl -s -c cookies.txt http://localhost:3000/api/auth/csrf > csrf.json
CSRF_TOKEN=$(cat csrf.json | jq -r '.csrfToken')

# Step 2: 登录（会设置 NextAuth.js session cookie）
curl -b cookies.txt -c cookies.txt \
  -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "email=admin@example.com" \
  --data-urlencode "password=admin123" \
  --data-urlencode "callbackUrl=http://localhost:3000/dashboard" \
  --data-urlencode "json=true"

# Step 3: 调用 API（使用 session cookie）
curl -b cookies.txt \
  -X POST http://localhost:3000/api/flowcharts \
  -H "Content-Type: application/json" \
  -d '{"title":"新流程图","markdown":"flowchart TD\n    Start --> End"}'

# 清理
rm cookies.txt csrf.json
```

### 方法 3: 使用浏览器

1. 打开浏览器访问 http://localhost:3000/login
2. 使用凭据登录：
   - Email: `admin@example.com`
   - Password: `admin123`
3. 打开浏览器 DevTools → Network 标签
4. 点击 "+ New Flowchart" 按钮
5. 查看 POST /api/flowcharts 请求 → 应该返回 **201 Created**

---

## 测试结果

### ✅ 正确的请求（有 NextAuth.js session）

```bash
$ ./test-api.sh

Step 4: Creating new flowchart...
{
  "id": 4,
  "title": "Test Flowchart from API",
  "markdown": "flowchart TD\n    A[Start] --> B[End]",
  "status": "draft",
  "publishedAt": null,
  "createdAt": "2025-11-18T22:46:18.000Z",
  "updatedAt": "2025-11-18T22:46:18.000Z"
}
```

**响应**: 201 Created ✅

### ❌ 错误的请求（使用 Clerk cookies）

```bash
$ curl 'http://localhost:3000/api/flowcharts' \
  -b '__clerk_db_jwt=...; __session=...' \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"title":"Untitled Flowchart","markdown":"flowchart TD\n    Start --> End"}'

{"error":"Unauthorized"}
```

**响应**: 401 Unauthorized ❌

---

## 认证系统对比

| 项目 | 认证系统 | Session Cookie 名称 |
|------|---------|-------------------|
| 您之前的项目 | Clerk | `__clerk_db_jwt`, `__session` |
| **本项目** | **NextAuth.js** | **`authjs.session-token`** |

---

## 服务器日志验证

查看服务器日志可以看到：

```
# 使用正确的 NextAuth.js session
POST /api/flowcharts 201 in 242ms  ✅ 成功

# 使用错误的 Clerk cookies 或无 session
POST /api/flowcharts 401 in 415ms  ❌ 失败
```

---

## API 端点列表

### Authentication
- `GET  /api/auth/csrf` - 获取 CSRF token
- `POST /api/auth/callback/credentials` - 登录
- `POST /api/auth/signout` - 登出

### Flowcharts
- `GET    /api/flowcharts` - 获取所有流程图
- `POST   /api/flowcharts` - 创建新流程图
- `GET    /api/flowcharts/[id]` - 获取特定流程图
- `PUT    /api/flowcharts/[id]` - 更新流程图
- `DELETE /api/flowcharts/[id]` - 删除流程图

---

## 快速测试

运行这个命令来验证 API 工作正常：

```bash
./test-api.sh
```

您应该看到所有步骤都返回成功的 JSON 响应。

---

## 总结

**问题**: 使用了错误认证系统的 cookies（Clerk 而不是 NextAuth.js）
**解决**: 使用正确的认证流程（见上面的方法）
**结果**: 所有 API 端点都正常工作 ✅
