import React from "react";
import TopBar from "../components/layout/TopBar";
import Button from "../components/ui/Button";
import { DeviceCard } from "../components/device/DeviceCard";

export default function DeviceListView({
  data,
  isLoading,
  isError,
  onLogout,
  onEdit,
}: {
  data?: any[];
  isLoading: boolean;
  isError: boolean;
  onLogout: () => void;
  onEdit: (d: any) => void;
}) {
  return (
    <section className="view">
      <TopBar
        title="Danh sách thiết bị"
        right={
          <Button className="btn--ghost" onClick={onLogout}>
            Đăng xuất
          </Button>
        }
      />
      <div className="content">
        {isLoading && (
          <div className="notice notice--info">
            Đang tải danh sách thiết bị...
          </div>
        )}
        {isError && (
          <div className="notice notice--danger">
            Lỗi tải danh sách thiết bị!
          </div>
        )}
        <ul className="list">
          {data?.map((d: any) => (
            <DeviceCard key={d.maThietBi} d={d} onEdit={onEdit} />
          ))}
        </ul>
      </div>
    </section>
  );
}
