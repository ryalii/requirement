// Seed data script - inserts mock data through the backend API
const BASE = 'http://localhost:8080/api/v1';

let TOKEN = '';

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`${method} ${path}: ${json.message}`);
  return json.data;
}

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  });
  const json = await res.json();
  TOKEN = json.data.token;
  console.log('Logged in, token obtained');
}

async function main() {
  await login();

  // 0. Clear existing data first (reverse dependency order)
  console.log('Clearing existing data...');
  const deleteEndpoints = [
    '/test-cases/batch', '/tasks?pageSize=100', '/projects?pageSize=100',
  ];
  // Delete tasks one by one
  const existingTasks = await api('GET', '/tasks?pageSize=100');
  if (existingTasks && existingTasks.list) {
    for (const t of existingTasks.list) {
      try { await api('DELETE', `/tasks/${t.id}`); } catch {}
    }
  }
  // Delete requirements
  const existingReqs = await api('GET', '/requirements?pageSize=100');
  if (existingReqs && existingReqs.list) {
    for (const r of existingReqs.list) {
      try { await api('DELETE', `/requirements/${r.id}`); } catch {}
    }
  }
  // Delete projects (cascades versions, iterations)
  const existingProjects = await api('GET', '/projects?pageSize=100');
  if (existingProjects && existingProjects.list) {
    for (const p of existingProjects.list) {
      try { await api('DELETE', `/projects/${p.id}`); } catch {}
    }
  }
  console.log('Existing data cleared.');

  // 1. Create Projects
  const projects = [
    { name: '用户管理系统升级项目', code: 'Terra', financeCode: '82525', owner: '张伟', manager: '李明', startDate: '2024-01-01', endDate: '2024-06-30', status: '进行中', description: '对现有用户管理系统进行全面升级' },
    { name: '报表系统定制项目', code: 'Phoenix', financeCode: '82526', owner: '王芳', manager: '赵强', startDate: '2024-02-01', endDate: '2024-07-31', status: '进行中', description: '定制化报表系统开发' },
    { name: '移动端适配项目', code: 'Atlas', financeCode: '82527', owner: '陈刚', manager: '刘洋', startDate: '2024-03-01', endDate: '2024-08-31', status: '进行中', description: '现有系统移动端适配开发' },
    { name: '智能客服系统项目', code: 'Nova', financeCode: '82528', owner: '孙丽', manager: '周杰', startDate: '2024-04-01', endDate: '2024-12-31', status: '未开始', description: '智能客服系统开发' },
  ];
  const projectIds = [];
  for (const p of projects) {
    // Check if project already exists (logical delete means unique constraint still applies)
    try {
      const created = await api('POST', '/projects', p);
      projectIds.push(created.id);
      console.log(`  Project created: ${created.name} (id=${created.id})`);
    } catch {
      // Project code already exists, try with timestamp suffix
      const ts = Date.now().toString().slice(-4);
      p.code = p.code + '-' + ts;
      const created = await api('POST', '/projects', p);
      projectIds.push(created.id);
      console.log(`  Project created (alt code): ${created.name} (id=${created.id}, code=${created.code})`);
    }
  }

  // 2. Create Versions
  const versions = [
    { productName: '用户管理系统', projectId: projectIds[0], versionNumber: 'V1.0.0', startDate: '2024-01-01', endDate: '2024-03-31', status: '已发布', description: '首个正式版本' },
    { productName: '用户管理系统', projectId: projectIds[0], versionNumber: 'V1.1.0', startDate: '2024-04-01', endDate: '2024-06-30', status: '进行中', description: '功能增强版本' },
    { productName: '报表系统', projectId: projectIds[1], versionNumber: 'V1.0.0', startDate: '2024-02-01', endDate: '2024-05-31', status: '进行中', description: '首个正式版本' },
    { productName: '移动端APP', projectId: projectIds[2], versionNumber: 'V1.0.0', startDate: '2024-03-01', endDate: '2024-06-30', status: '进行中', description: '首个移动端版本' },
  ];
  const versionIds = [];
  for (const v of versions) {
    const created = await api('POST', '/versions', v);
    versionIds.push(created.id);
    console.log(`  Version created: ${created.versionNumber} (id=${created.id})`);
  }

  // 3. Create Iterations
  const iterations = [
    // Project 1 / Version 1 iterations
    { name: 'Sprint 1', projectId: projectIds[0], productName: '用户管理系统', versionId: versionIds[0], startDate: '2024-01-01', endDate: '2024-01-31', status: '已完成', description: '用户认证模块开发' },
    { name: 'Sprint 2', projectId: projectIds[0], productName: '用户管理系统', versionId: versionIds[0], startDate: '2024-02-01', endDate: '2024-02-29', status: '已完成', description: '权限管理模块开发' },
    { name: 'Sprint 3', projectId: projectIds[0], productName: '用户管理系统', versionId: versionIds[0], startDate: '2024-03-01', endDate: '2024-03-31', status: '已完成', description: '系统集成测试' },
    // Project 1 / Version 2 iterations
    { name: 'Sprint 4', projectId: projectIds[0], productName: '用户管理系统', versionId: versionIds[1], startDate: '2024-04-01', endDate: '2024-04-30', status: '进行中', description: 'OAuth2.0集成' },
    { name: 'Sprint 5', projectId: projectIds[0], productName: '用户管理系统', versionId: versionIds[1], startDate: '2024-05-01', endDate: '2024-05-31', status: '规划中', description: '高级权限功能开发' },
    // Project 2 / Version 3 iterations
    { name: 'Sprint 1', projectId: projectIds[1], productName: '报表系统', versionId: versionIds[2], startDate: '2024-02-01', endDate: '2024-03-15', status: '已完成', description: '数据采集模块开发' },
    { name: 'Sprint 2', projectId: projectIds[1], productName: '报表系统', versionId: versionIds[2], startDate: '2024-03-16', endDate: '2024-04-30', status: '进行中', description: '报表展示模块开发' },
    // Project 3 / Version 4 iterations
    { name: 'Sprint 1', projectId: projectIds[2], productName: '移动端APP', versionId: versionIds[3], startDate: '2024-03-01', endDate: '2024-04-15', status: '进行中', description: '移动端首页开发' },
  ];
  const iterationIds = [];
  for (const i of iterations) {
    const created = await api('POST', '/iterations', i);
    iterationIds.push(created.id);
    console.log(`  Iteration created: ${created.name} (id=${created.id})`);
  }

  // 4. Create Requirements (LMT)
  const lmtReqs = [
    { name: '智能客服系统需求', type: 'LMT', customer: '京东科技', project: '智能客服项目', expectedDate: '2024-09-30', status: '待分析', priority: '高', description: '客户需要一套智能客服系统，支持多渠道接入和智能问答。' },
    { name: '数据中台建设需求', type: 'LMT', customer: '美团点评', project: '数据中台项目', expectedDate: '2024-10-15', status: '待分析', priority: '中', description: '建设企业级数据中台，实现数据统一管理和共享。' },
    { name: '供应链管理优化', type: 'LMT', customer: '小米科技', project: '', expectedDate: '2024-11-01', status: '待分析', priority: '低', description: '优化现有供应链管理系统，提升效率和可视化程度。' },
  ];
  for (const r of lmtReqs) {
    const created = await api('POST', '/requirements', r);
    console.log(`  LMT created: ${created.name} (id=${created.id}, code=${created.code})`);
  }
  // IR Requirements
  const irReqs = [
    { name: '用户管理系统升级', type: 'IR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-06-30', status: '进行中', priority: '高', description: '客户要求对现有用户管理系统进行全面升级，包括用户认证、权限管理等功能。' },
    { name: '报表系统定制开发', type: 'IR', customer: '阿里巴巴', project: '报表系统项目', expectedDate: '2024-07-15', status: '待分析', priority: '中', description: '需要定制化报表系统，支持多维度数据分析和可视化展示。' },
    { name: '移动端适配需求', type: 'IR', customer: '腾讯科技', project: '移动端项目', expectedDate: '2024-08-01', status: '待分析', priority: '高', description: '现有系统需要支持移动端访问，要求响应式设计和原生APP开发。' },
  ];
  const irIds = [];
  for (const r of irReqs) {
    const created = await api('POST', '/requirements', r);
    irIds.push(created.id);
    console.log(`  IR created: ${created.name} (id=${created.id}, code=${created.code})`);
  }

  // 5. Create SR Requirements (depend on IR)
  const srReqs = [
    { name: '用户认证模块重构', type: 'SR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-04-30', status: '进行中', priority: '高', description: '重构用户认证模块，支持多种认证方式包括OAuth2.0、SAML等。', parentId: irIds[0] },
    { name: '权限管理系统设计', type: 'SR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-05-15', status: '进行中', priority: '高', description: '设计基于RBAC的权限管理系统，支持细粒度权限控制。', parentId: irIds[0] },
    { name: '报表数据采集模块', type: 'SR', customer: '阿里巴巴', project: '报表系统项目', expectedDate: '2024-05-30', status: '待分析', priority: '中', description: '开发数据采集模块，支持多数据源接入和数据清洗。', parentId: irIds[1] },
    { name: '移动端UI框架选型', type: 'SR', customer: '腾讯科技', project: '移动端项目', expectedDate: '2024-04-15', status: '已完成', priority: '中', description: '完成移动端UI框架的技术选型和原型设计。', parentId: irIds[2] },
  ];
  const srIds = [];
  for (const r of srReqs) {
    const created = await api('POST', '/requirements', r);
    srIds.push(created.id);
    console.log(`  SR created: ${created.name} (id=${created.id}, code=${created.code})`);
  }

  // 6. Create AR Requirements (depend on SR, some on iterations)
  const arReqs = [
    { name: '登录接口开发', type: 'AR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-03-15', status: '已完成', priority: '高', description: '开发用户登录API接口，支持JWT token认证。', parentId: srIds[0], iterationId: iterationIds[0], frontend: '小王', backend: '小李', tester: '小张' },
    { name: 'OAuth2.0集成', type: 'AR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-04-01', status: '进行中', priority: '高', description: '集成OAuth2.0认证协议，支持第三方登录。', parentId: srIds[0], iterationId: iterationIds[3], frontend: '小王', backend: '小李', tester: '小张' },
    { name: '角色管理API', type: 'AR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-04-15', status: '进行中', priority: '中', description: '开发角色管理相关API，包括角色CRUD和权限分配。', parentId: srIds[1], iterationId: iterationIds[3], frontend: '小赵', backend: '小钱', tester: '小孙' },
    { name: '权限校验中间件', type: 'AR', customer: '华为技术', project: '用户管理项目', expectedDate: '2024-04-20', status: '待分析', priority: '高', description: '开发通用权限校验中间件，实现请求级别的权限控制。', parentId: srIds[1] },
    { name: '数据源连接池管理', type: 'AR', customer: '阿里巴巴', project: '报表系统项目', expectedDate: '2024-04-30', status: '待分析', priority: '中', description: '实现多数据源连接池管理，支持动态数据源切换。', parentId: srIds[2] },
    { name: '移动端首页开发', type: 'AR', customer: '腾讯科技', project: '移动端项目', expectedDate: '2024-05-01', status: '待分析', priority: '中', description: '开发移动端首页界面，包括导航和核心功能入口。', parentId: srIds[3] },
  ];
  const arIds = [];
  for (const r of arReqs) {
    const created = await api('POST', '/requirements', r);
    arIds.push(created.id);
    console.log(`  AR created: ${created.name} (id=${created.id}, code=${created.code})`);
  }

  // 7. Create Tasks (using API assign/status endpoints after creation)
  const tasks = [
    { name: '用户登录功能分析', type: '需求', creator: '管理员', deadline: '2024-04-15', description: '分析用户登录功能的需求，包括多种登录方式的支持。' },
    { name: '接口自动化测试', type: '测试', creator: '管理员', deadline: '2024-04-10', description: '完成用户管理模块的接口自动化测试用例编写。' },
    { name: '紧急bug修复', type: '临时', creator: '管理员', deadline: '2024-03-25', description: '修复生产环境的紧急bug。' },
    { name: '技术方案调研', type: '调研', creator: '管理员', deadline: '2024-04-20', description: '调研新一代微服务架构方案。' },
    { name: '客户现场支持', type: '支持', creator: '管理员', deadline: '2024-04-05', description: '协助华为客户现场部署和培训。' },
    { name: '性能测试执行', type: '测试', creator: '管理员', deadline: '2024-04-12', description: '执行系统性能压力测试。' },
    { name: '需求评审准备', type: '需求', creator: '管理员', deadline: '2024-03-30', description: '准备下周的需求评审会议材料。' },
    { name: 'AI技术预研', type: '调研', creator: '管理员', deadline: '2024-05-01', description: '预研大模型在智能客服中的应用。' },
  ];
  for (const t of tasks) {
    const created = await api('POST', '/tasks', t);
    console.log(`  Task created: ${created.name} (id=${created.id}, code=${created.code})`);
  }

  // 8. Create test cases for AR requirements
  const testCases = [
    { arReqIdx: 0, cases: [
      { name: '用户登录功能验证', priority: '高', status: '通过' },
      { name: '用户注册流程测试', priority: '高', status: '通过' },
      { name: '密码重置功能验证', priority: '中', status: '未执行' },
      { name: '用户权限校验测试', priority: '高', status: '失败' },
      { name: '会话超时处理测试', priority: '低', status: '通过' },
    ]},
  ];
  for (const tcGroup of testCases) {
    const arId = arIds[tcGroup.arReqIdx];
    for (const tc of tcGroup.cases) {
      try {
        await api('POST', `/requirements/${arId}/test-cases`, tc);
        console.log(`  Test case created: ${tc.name} for AR id=${arId}`);
      } catch (e) {
        console.log(`  Skip test case (may be already created): ${e.message}`);
      }
    }
  }

  console.log('\n=== Seed completed! ===');
  console.log(`Projects: ${projectIds.length}`);
  console.log(`Versions: ${versionIds.length}`);
  console.log(`Iterations: ${iterationIds.length}`);
  console.log(`Requirements (LMT): ${lmtReqs.length}`);
  console.log(`Requirements (IR): ${irIds.length}`);
  console.log(`Requirements (SR): ${srIds.length}`);
  console.log(`Requirements (AR): ${arIds.length}`);
  console.log(`Tasks: ${tasks.length}`);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
