import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Settings, HardDrive, Trash2, ShieldCheck } from 'lucide-react';
import { clearLocalStorageSession } from '../services/storageService';

export const SettingsPage: React.FC = () => {
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn dọn dẹp bộ nhớ tạm trên trình duyệt? Hành động này sẽ đưa bài giảng về trạng thái ban đầu.')) {
      clearLocalStorageSession();
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-6 text-slate-100 font-sans max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Cấu Hình & Quản Lý Bộ Nhớ</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cấu hình Local-First Storage & Trợ lý AI</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <Badge variant="indigo">Local-First Storage</Badge>
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
            <CardTitle className="mt-2 text-base font-bold">Bộ Nhớ Trình Duyệt Local Storage</CardTitle>
            <CardDescription>Toàn bộ thao tác ghi chú và dữ liệu slide được mã hóa và lưu tại máy cá nhân</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Chế độ No-DB đang hoạt động hoàn hảo. Dữ liệu tuyệt đối không bị gửi lên Server trung gian.</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Reset Bộ Nhớ Tạm</h5>
                <p className="text-[11px] text-slate-400">Xóa dữ liệu bài giảng đang lưu trong LocalStorage để khôi phục mặc định.</p>
              </div>
              <Button
                onClick={handleClear}
                variant="destructive"
                className="text-xs font-bold px-4 py-2 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{cleared ? 'Đã Xóa!' : 'Xóa Dữ Liệu Local'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
