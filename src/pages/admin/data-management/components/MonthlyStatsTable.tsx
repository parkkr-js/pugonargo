import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { cellStyle } from "../../../../styles";
import type { MonthlyStatsListItem } from "../../../../types/dataManagement";

interface TableRow {
	id: string;
	recordCount: number;
}

interface MonthlyStatsTableProps {
	data: MonthlyStatsListItem[];
	onDelete: (monthId: string) => void;
	isDeleting: boolean;
	isLoading: boolean;
}

export const MonthlyStatsTable = ({
	data,
	onDelete,
	isDeleting,
	isLoading,
}: MonthlyStatsTableProps) => {
	const columns: TableColumnsType<TableRow> = [
		{
			title: "월",
			dataIndex: "id",
			key: "id",
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
			render: (id: string) => (
				<Tag color="blue" style={{ fontSize: "14px", padding: "4px 8px" }}>
					{id}
				</Tag>
			),
		},
		{
			title: "레코드 수",
			dataIndex: "recordCount",
			key: "recordCount",
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
			render: (count: number) => (
				<span style={{ fontWeight: 600, color: "#1890ff" }}>
					{count.toLocaleString()}개
				</span>
			),
		},
		{
			title: "작업",
			key: "action",
			ellipsis: true,
			onCell: () => ({ style: cellStyle }),
			render: (_: unknown, record: MonthlyStatsListItem) => (
				<Popconfirm
					title="데이터 삭제"
					description={`${record.id} 월의 모든 데이터를 삭제하시겠습니까?`}
					onConfirm={() => onDelete(record.id)}
					okText="삭제"
					cancelText="취소"
					okButtonProps={{ danger: true }}
				>
					<Button
						type="primary"
						danger
						icon={<DeleteOutlined />}
						loading={isDeleting}
						disabled={isDeleting}
					>
						삭제
					</Button>
				</Popconfirm>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={data}
			rowKey="id"
			pagination={{
				pageSize: 30,
				showSizeChanger: false,
				showQuickJumper: false,
				showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
			}}
			loading={isLoading}
			locale={{
				emptyText: "데이터가 없습니다.",
			}}
		/>
	);
};
