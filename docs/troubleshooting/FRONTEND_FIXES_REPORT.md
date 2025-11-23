# Frontend 错误处理优化报告

**日期**: 2025-11-19
**状态**: ✅ 完成

---

## 问题描述

用户报告了一个严重的前端体验问题：
当API返回 **401 Unauthorized** 时（例如session过期），用户没有收到任何提示，页面也没有跳转到登录页面，导致用户不知道发生了什么。

### 用户场景
```
1. 用户登录后使用系统
2. Session过期（例如30分钟后）
3. 用户点击 "+ New Flowchart" 按钮
4. API返回 401 Unauthorized
5. ❌ 什么都没发生 - 按钮只是停止loading
6. ❌ 用户不知道发生了什么
7. ❌ 没有跳转到登录页面
```

---

## 根本原因

所有的API调用代码只检查 `response.ok`，但不处理特定的HTTP状态码：

```typescript
// ❌ 原来的代码
try {
  const response = await fetch('/api/flowcharts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    // 处理成功
  }
  // ❌ 如果是401，什么都不做！
} catch (error) {
  console.error('Failed:', error);
}
```

**问题**:
- 没有检测401状态码
- 没有自动跳转到登录页
- 没有给用户任何提示

---

## 解决方案

### 1. 创建统一的API客户端

创建 `lib/api-client.ts`：

```typescript
/**
 * Fetch wrapper that automatically redirects to login on 401 Unauthorized
 */
export async function apiClient(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // 自动重定向到登录页面
  if (response.status === 401) {
    window.location.href = '/login?error=SessionExpired';
    throw new Error('Unauthorized: Session expired');
  }

  return response;
}
```

**特点**:
- ✅ 自动检测401状态码
- ✅ 立即跳转到登录页面
- ✅ 传递 `error=SessionExpired` 参数
- ✅ 抛出错误阻止后续处理
- ✅ 可复用于所有API调用

### 2. 更新所有API调用

#### `components/dashboard/flowchart-list.tsx`

**更新3个函数**:

```typescript
import { apiClient } from '@/lib/api-client';

// ✅ 创建新flowchart
async function handleCreateNew() {
  try {
    const response = await apiClient('/api/flowcharts', {
      method: 'POST',
      body: JSON.stringify({ title, markdown }),
    });

    if (response.ok) {
      router.push(`/editor/${newFlowchart.id}`);
    }
  } catch (error) {
    // 401已被apiClient处理（自动跳转）
  }
}

// ✅ 删除flowchart
async function handleDelete(id: number) {
  const response = await apiClient(`/api/flowcharts/${id}`, {
    method: 'DELETE',
  });
}

// ✅ 发布/取消发布
async function handlePublishToggle(id: number) {
  const response = await apiClient(`/api/flowcharts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus }),
  });
}
```

#### `components/editor/flowchart-editor.tsx`

**更新2个函数**:

```typescript
import { apiClient } from '@/lib/api-client';

// ✅ 自动保存
const handleSave = useCallback(async () => {
  const response = await apiClient(`/api/flowcharts/${flowchart.id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, markdown }),
  });

  if (response.ok) {
    setLastSaved(new Date());
  }
}, [flowchart.id, title, markdown]);

// ✅ 发布
async function handlePublishToggle() {
  const response = await apiClient(`/api/flowcharts/${flowchart.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus }),
  });
}
```

### 3. 优化登录页面体验

#### 添加Session过期提示

`app/login/login-form.tsx`:

```typescript
const getErrorMessage = (err: string | undefined) => {
  if (!err) return '';
  if (err === 'SessionExpired') {
    return 'Your session has expired. Please sign in again.';
  }
  return err;
};
```

#### 区分错误类型 - 不同的视觉设计

```typescript
{error && (
  <div className={`rounded-md p-4 ${
    error.includes('session has expired')
      ? 'bg-yellow-50 border border-yellow-200'  // ⚠️ 黄色警告
      : 'bg-red-50'  // ❌ 红色错误
  }`}>
    <div className="flex">
      <div className="flex-shrink-0">
        {error.includes('session has expired') ? (
          // ⚠️ 警告图标
          <svg className="h-5 w-5 text-yellow-400">...</svg>
        ) : (
          // ❌ 错误图标
          <svg className="h-5 w-5 text-red-400">...</svg>
        )}
      </div>
      <div className="ml-3">
        <p className={`text-sm ${
          error.includes('session has expired')
            ? 'text-yellow-800'
            : 'text-red-800'
        }`}>
          {error}
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 用户体验流程对比

### 修复前 ❌

```
1. 用户session过期
2. 点击 "+ New Flowchart"
3. API返回 401
4. 按钮停止loading
5. ❌ 没有任何反馈
6. ❌ 用户困惑：发生了什么？
7. ❌ 用户需要手动导航到登录页
```

### 修复后 ✅

```
1. 用户session过期
2. 点击 "+ New Flowchart"
3. API返回 401
4. ✅ apiClient自动检测401
5. ✅ 立即跳转到 /login?error=SessionExpired
6. ✅ 显示黄色警告框：
   "⚠️ Your session has expired. Please sign in again."
7. ✅ 用户明确知道发生了什么
8. ✅ 用户可以立即重新登录
```

---

## 受影响的API端点

所有以下API调用现在都会自动处理401：

| 位置 | API端点 | 方法 | 功能 |
|------|---------|------|------|
| Dashboard | `/api/flowcharts` | POST | 创建新flowchart |
| Dashboard | `/api/flowcharts/:id` | DELETE | 删除flowchart |
| Dashboard | `/api/flowcharts/:id` | PUT | 发布/取消发布 |
| Editor | `/api/flowcharts/:id` | PUT | 自动保存 |
| Editor | `/api/flowcharts/:id` | PUT | 发布flowchart |

---

## 测试验证

### 测试场景 1: Session过期后创建flowchart

```bash
# 1. 登录
# 2. 等待session过期（或手动删除cookie）
# 3. 点击 "+ New Flowchart"

预期结果:
✅ 立即跳转到登录页面
✅ 显示黄色警告："Your session has expired. Please sign in again."
```

### 测试场景 2: Session过期后自动保存

```bash
# 1. 登录并打开editor
# 2. 编辑markdown
# 3. session过期
# 4. 自动保存触发

预期结果:
✅ 自动跳转到登录页面
✅ 显示session过期提示
```

### 测试场景 3: 正常登录错误

```bash
# 1. 访问登录页面
# 2. 输入错误的邮箱/密码
# 3. 点击登录

预期结果:
✅ 显示红色错误框："❌ Invalid email or password"
✅ 不会显示黄色警告
```

---

## 额外改进

### 1. 统一错误处理

```typescript
catch (error) {
  // apiClient已经处理了401（自动跳转）
  if (error instanceof Error && !error.message.includes('Unauthorized')) {
    console.error('Failed:', error);
  }
}
```

- ✅ 避免重复记录401错误
- ✅ 只记录真正的网络错误

### 2. 更好的日志记录

```typescript
if (response.ok) {
  // success
} else {
  console.error('Failed to create flowchart:', response.statusText);
}
```

- ✅ 记录具体的HTTP状态文本
- ✅ 更容易调试

### 3. 类型安全

```typescript
interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}
```

- ✅ TypeScript类型安全
- ✅ 更好的IDE支持

---

## 代码覆盖率

| 文件 | 状态 | 说明 |
|------|------|------|
| `lib/api-client.ts` | ✅ 新建 | 统一API客户端 |
| `components/dashboard/flowchart-list.tsx` | ✅ 更新 | 3个函数使用apiClient |
| `components/editor/flowchart-editor.tsx` | ✅ 更新 | 2个函数使用apiClient |
| `app/login/login-form.tsx` | ✅ 更新 | 添加session过期提示 |

**总计**: 1个新文件，3个更新文件，5个函数修复

---

## 性能影响

- ✅ **无性能损失** - apiClient只是一个轻量级wrapper
- ✅ **响应更快** - `window.location.href`立即重定向
- ✅ **用户体验提升** - 立即反馈vs无响应

---

## 浏览器兼容性

- ✅ Chrome/Edge: 完全支持
- ✅ Firefox: 完全支持
- ✅ Safari: 完全支持

---

## 安全性

- ✅ **不泄露敏感信息** - 错误消息友好
- ✅ **防止CSRF** - 保持现有的CSRF保护
- ✅ **Session管理** - 由NextAuth.js处理

---

## 未来改进建议

1. **添加Toast通知系统**
   - 更优雅的错误提示
   - 不依赖页面刷新

2. **添加重试机制**
   - 网络错误自动重试
   - 指数退避策略

3. **添加离线检测**
   - 检测网络连接状态
   - 显示"您已离线"提示

4. **添加Analytics**
   - 跟踪401错误频率
   - 优化session过期时间

---

## 总结

✅ **问题**: 401错误时无提示，用户体验差
✅ **解决**: 统一API客户端 + 自动跳转 + 友好提示
✅ **影响**: 5个API调用，4个文件
✅ **结果**: 专业的错误处理，企业级用户体验

**用户受益**:
- 明确知道session过期
- 自动跳转到登录页
- 友好的提示消息
- 无需手动导航

---

**修复完成时间**: 2025-11-19
**修复人员**: Claude (Senior Staff Engineer)
**状态**: ✅ Ready for Production
