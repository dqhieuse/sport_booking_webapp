import { EmptyState } from "~/components/common/EmptyState";

export default function BookingHistoryPage() {
  return (
    <EmptyState
      title="Chưa có lịch đặt sân"
      description="Sau khi tích hợp API booking history, danh sách đặt sân của user sẽ hiển thị tại đây."
    />
  );
}
