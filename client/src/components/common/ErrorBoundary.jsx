import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Đã xảy ra lỗi hiển thị</h2>
              <p className="text-xs text-slate-500 mt-2">
                Hệ thống gặp sự cố khi dựng giao diện trang này. Vui lòng tải lại trang hoặc quay về Bảng điều khiển chính.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 bg-slate-100 rounded-lg text-left text-[11px] font-mono text-slate-600 overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Tải lại trang</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Home size={14} />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
