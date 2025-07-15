import React, { useState, useEffect } from 'react';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  SettingOutlined 
} from '@ant-design/icons';

interface InstallStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

interface InstallConfig {
  database_url: string;
  database_namespace_auth: string;
  database_name_auth: string;
  database_namespace_docs: string;
  database_name_docs: string;
  admin_username: string;
  admin_email: string;
  admin_password: string;
  admin_password_confirm: string;
  site_name: string;
  site_description?: string;
  jwt_secret: string;
}

interface InstallationStatus {
  is_installed: boolean;
  config_exists: boolean;
  database_initialized: boolean;
  admin_created: boolean;
  install_time?: string;
}

export default function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<InstallStep[]>([]);
  const [installStatus, setInstallStatus] = useState<InstallationStatus | null>(null);
  const [config, setConfig] = useState<InstallConfig>({
    database_url: '127.0.0.1:8686',
    database_namespace_auth: 'auth',
    database_name_auth: 'main',
    database_namespace_docs: 'docs',
    database_name_docs: 'main',
    admin_username: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirm: '',
    site_name: 'Rainbow Docs',
    site_description: '',
    jwt_secret: '',
  });
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstallStatus();
    fetchSteps();
    generateJwtSecret();
  }, []);

  const fetchInstallStatus = async () => {
    try {
      const response = await fetch('/api/install/status');
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setInstallStatus(data.data);
        if (data.data.is_installed) {
          // 系统已安装，跳转到主页
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error('Failed to fetch install status:', err);
    }
  };

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/install/steps');
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setSteps(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch install steps:', err);
    }
  };

  const generateJwtSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setConfig(prev => ({ ...prev, jwt_secret: result }));
  };

  const handleConfigChange = (field: keyof InstallConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (): boolean => {
    setError('');
    
    switch (currentStep) {
      case 2: // 数据库配置
        if (!config.database_url.trim()) {
          setError('请输入数据库连接地址');
          return false;
        }
        if (!config.database_namespace_auth.trim()) {
          setError('请输入Auth系统数据库命名空间');
          return false;
        }
        if (!config.database_name_auth.trim()) {
          setError('请输入Auth系统数据库名称');
          return false;
        }
        if (!config.database_namespace_docs.trim()) {
          setError('请输入Docs系统数据库命名空间');
          return false;
        }
        if (!config.database_name_docs.trim()) {
          setError('请输入Docs系统数据库名称');
          return false;
        }
        break;
      case 3: // 管理员账户
        if (!config.admin_username.trim()) {
          setError('请输入管理员用户名');
          return false;
        }
        if (!config.admin_email.trim()) {
          setError('请输入管理员邮箱');
          return false;
        }
        if (!config.admin_password.trim()) {
          setError('请输入管理员密码');
          return false;
        }
        if (config.admin_password !== config.admin_password_confirm) {
          setError('两次输入的密码不一致');
          return false;
        }
        if (config.admin_password.length < 6) {
          setError('密码长度至少6位');
          return false;
        }
        break;
      case 4: // 站点配置
        if (!config.site_name.trim()) {
          setError('请输入站点名称');
          return false;
        }
        break;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const performInstall = async () => {
    if (!validateStep()) return;
    
    setInstalling(true);
    setError('');
    
    try {
      const installConfig = {
        database_url: config.database_url,
        database_namespace_auth: config.database_namespace_auth,
        database_name_auth: config.database_name_auth,
        database_namespace_docs: config.database_namespace_docs,
        database_name_docs: config.database_name_docs,
        admin_username: config.admin_username,
        admin_email: config.admin_email,
        admin_password: config.admin_password,
        site_name: config.site_name,
        site_description: config.site_description,
        jwt_secret: config.jwt_secret,
      };
      
      const response = await fetch('/api/install/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(installConfig),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // 安装成功，等待几秒后跳转
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setError(data.message || '安装失败');
      }
    } catch (err) {
      setError('安装过程中发生错误');
    } finally {
      setInstalling(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <SettingOutlined className="text-6xl text-blue-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">欢迎使用 Rainbow Docs 安装向导</h3>
            <p className="text-gray-600 mb-6">
              本向导将帮助您完成 Rainbow Docs 文档系统的初始化配置
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <ExclamationCircleOutlined className="text-yellow-400 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-700">
                  <p>请确保您已经：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>启动了 SurrealDB 数据库服务</li>
                    <li>具有数据库的读写权限</li>
                    <li>准备好管理员账户信息</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">数据库配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据库连接地址
                </label>
                <input
                  type="text"
                  value={config.database_url}
                  onChange={(e) => handleConfigChange('database_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="127.0.0.1:8686"
                />
                <p className="text-sm text-gray-500 mt-1">
                  SurrealDB 的连接地址（IP:端口）
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auth系统数据库命名空间
                  </label>
                  <input
                    type="text"
                    value={config.database_namespace_auth}
                    onChange={(e) => handleConfigChange('database_namespace_auth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="auth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auth系统数据库名称
                  </label>
                  <input
                    type="text"
                    value={config.database_name_auth}
                    onChange={(e) => handleConfigChange('database_name_auth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="main"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Docs系统数据库命名空间
                  </label>
                  <input
                    type="text"
                    value={config.database_namespace_docs}
                    onChange={(e) => handleConfigChange('database_namespace_docs', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="docs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Docs系统数据库名称
                  </label>
                  <input
                    type="text"
                    value={config.database_name_docs}
                    onChange={(e) => handleConfigChange('database_name_docs', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="main"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                <p className="text-sm text-blue-700">
                  <strong>提示：</strong>Auth系统和Docs系统将使用不同的数据库命名空间来隔离数据，确保系统安全性。
                </p>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">创建管理员账户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={config.admin_username}
                  onChange={(e) => handleConfigChange('admin_username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={config.admin_email}
                  onChange={(e) => handleConfigChange('admin_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={config.admin_password}
                  onChange={(e) => handleConfigChange('admin_password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="至少6位"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <input
                  type="password"
                  value={config.admin_password_confirm}
                  onChange={(e) => handleConfigChange('admin_password_confirm', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="再次输入密码"
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">站点配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  站点名称
                </label>
                <input
                  type="text"
                  value={config.site_name}
                  onChange={(e) => handleConfigChange('site_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rainbow Docs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  站点描述（可选）
                </label>
                <textarea
                  value={config.site_description}
                  onChange={(e) => handleConfigChange('site_description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="简短描述您的文档站点"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JWT 密钥
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={config.jwt_secret}
                    onChange={(e) => handleConfigChange('jwt_secret', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={generateJwtSecret}
                    className="px-4 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    重新生成
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  用于 JWT Token 签名的密钥，建议使用自动生成的值
                </p>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="text-center">
            {installing ? (
              <div>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium mb-2">正在安装...</h3>
                <p className="text-gray-600">请稍候，正在初始化系统</p>
              </div>
            ) : (
              <div>
                <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">准备开始安装</h3>
                <p className="text-gray-600 mb-6">
                  请确认以上配置信息，点击开始安装按钮完成系统初始化
                </p>
                <div className="bg-gray-50 rounded-md p-4 text-left">
                  <h4 className="font-medium mb-2">配置概览：</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>数据库地址：</strong> {config.database_url}</li>
                    <li><strong>Auth数据库：</strong> {config.database_namespace_auth}/{config.database_name_auth}</li>
                    <li><strong>Docs数据库：</strong> {config.database_namespace_docs}/{config.database_name_docs}</li>
                    <li><strong>管理员：</strong> {config.admin_username} ({config.admin_email})</li>
                    <li><strong>站点名称：</strong> {config.site_name}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Rainbow Docs 安装向导
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep > step.step
                      ? 'bg-green-500 text-white'
                      : currentStep === step.step
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.step ? (
                      <CheckCircleOutlined />
                    ) : (
                      step.step
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 ml-2 ${
                      currentStep > step.step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                {steps.find(s => s.step === currentStep)?.title}
              </h3>
              <p className="text-sm text-gray-500">
                {steps.find(s => s.step === currentStep)?.description}
              </p>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationCircleOutlined className="text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 步骤内容 */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep <= 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一步
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                onClick={performInstall}
                disabled={installing}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {installing ? '安装中...' : '开始安装'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}