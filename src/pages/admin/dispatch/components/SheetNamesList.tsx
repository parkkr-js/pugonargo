import { List, Tag } from "antd";
import styled from "styled-components";

interface SheetNamesListProps {
	sheetNames: string[];
}

export const SheetNamesList = ({ sheetNames }: SheetNamesListProps) => (
	<Container>
		<Title>시트 목록</Title>
		<List
			dataSource={sheetNames}
			renderItem={(sheetName) => (
				<List.Item>
					<Tag color="blue" style={{ fontSize: "14px", padding: "8px 12px" }}>
						{sheetName}
					</Tag>
				</List.Item>
			)}
			locale={{
				emptyText: "시트를 찾을 수 없습니다.",
			}}
		/>
	</Container>
);

const Container = styled.div`
	padding: 16px;
	background: ${({ theme }) => theme.colors.background.secondary};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const Title = styled.h3`
	margin: 0 0 16px 0;
	font-size: ${({ theme }) => theme.fontSizes.lg};
	font-weight: ${({ theme }) => theme.fontWeights.bold};
	color: ${({ theme }) => theme.colors.text.primary};
`;
