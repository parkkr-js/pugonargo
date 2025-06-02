import { CalendarOutlined, DashboardOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { withAdminAuth } from "../../hoc/withAdminAuth";

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
	return (
		<AdminLayout>
			<div>
				{/* 페이지 헤더 */}
				<div style={{ marginBottom: "24px" }}>
					<Title
						level={2}
						style={{
							margin: 0,
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<DashboardOutlined />
						대시보드
					</Title>
					<Space style={{ margin: "8px 0 0 0" }}>
						<CalendarOutlined />
						<Tag color="blue">2025. 05월</Tag>
					</Space>
				</div>

				{/* 거래 내역 통계 */}
				<div style={{ marginBottom: "32px" }}>
					<Title level={4} style={{ marginBottom: "16px" }}>
						거래 내역
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: "16px" }}>
						구매 시스템에서 불러온 거래입니다.
					</Paragraph>

					<Row gutter={16}>
						<Col span={6}>
							<Card>
								<Statistic
									title="총 청구액(부가세 포함)"
									value={107898725}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#1890ff", textDecoration: "underline" }}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic
									title="총 청구액(공급가)"
									value={98089750}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#52c41a" }}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic
									title="총 지급금액"
									value={94807525}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#722ed1" }}
								/>
							</Card>
						</Col>
						<Col span={6}>
							<Card>
								<Statistic
									title="총 지급액(공급가)"
									value={86188660}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#fa8c16" }}
								/>
							</Card>
						</Col>
					</Row>
				</div>

				{/* 정비 · 유류비 섹션 */}
				<div style={{ marginBottom: "32px" }}>
					<Title level={4} style={{ marginBottom: "16px" }}>
						정비 · 유류비
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: "16px" }}>
						기사님들이 직접 입력한 거래입니다.
					</Paragraph>

					<Row gutter={16}>
						<Col span={8}>
							<Card>
								<Statistic
									title="총 비용"
									value={6188660}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#1890ff" }}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<Card>
								<Statistic
									title="총 정비비용"
									value={7898725}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#52c41a" }}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<Card>
								<Statistic
									title="총 유류비"
									value={8009750}
									precision={0}
									suffix="원"
									valueStyle={{ color: "#fa8c16" }}
								/>
							</Card>
						</Col>
					</Row>
				</div>

				{/* 최근 활동 요약 */}
				<Row gutter={16}>
					<Col span={12}>
						<Card title="시스템 현황" hoverable>
							<Space direction="vertical" style={{ width: "100%" }}>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<span>활성 기사</span>
									<span style={{ fontWeight: "bold" }}>3명</span>
								</div>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<span>등록된 차량</span>
									<span style={{ fontWeight: "bold" }}>4대</span>
								</div>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<span>이번 달 거래</span>
									<span style={{ fontWeight: "bold" }}>145건</span>
								</div>
								<div
									style={{ display: "flex", justifyContent: "space-between" }}
								>
									<span>대기 중인 업로드</span>
									<span style={{ fontWeight: "bold", color: "#fa8c16" }}>
										2건
									</span>
								</div>
							</Space>
						</Card>
					</Col>
					<Col span={12}>
						<Card title="빠른 작업" hoverable>
							<Space direction="vertical" style={{ width: "100%" }}>
								<div>• 새로운 기사 계정 생성</div>
								<div>• Excel 파일 업로드 및 동기화</div>
								<div>• 월간 정산 리포트 생성</div>
								<div>• 차량별 비용 분석</div>
							</Space>
						</Card>
					</Col>
				</Row>
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(DashboardPage);
