import { STATUS_COLOR, STATUS_LABEL, OrderStatus } from "@/context/OrdersContext";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`chip border ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
