// 상단에 '정비 · 유류비' 타이틀
// 타이틀 밑에 '총비용(값) = 총 정비비용(값) + 총 유류비(값)'
// 그 밑에는 정렬과 필터링이 가능한 antd 테이블이 있다.
// 테이블은 Cloud Firestore의 repair, fuel 컬렉션의 데이터들이 합쳐진 테이블이다.
// 열은 'Date'(yyyy/mm/dd), '그룹', '차량번호', '정비내역 · 주유단가', '총 비용' 5개이다.
// Date: 컬렉션에서 string인 year, month, day 속성을 합쳐서 yyyy/mm/dd 형식으로 표시한다.
// 그룹: 컬렉션에서 string인 vehicleNumber로 drivers 컬렉션의 string인 group 속성을 조회하여 그룹을 가져온다.
// 차량번호: 컬렉션에서 string인 vehicleNumber을 표시한다.
// 정비내역 · 주유단가: fuel 컬렉션에서 fuelPrice 속성이 주유단가이고, repair 컬렉션에서 repairDescription 속성이 정비내역이다. 둘을 합쳐서 표시하는것이 아니다.
// 총 비용: fuel 컬렉션에서 totalFuelCost, repair 컬렉션에서 repairCost 속성이다. 둘을 합쳐서 표시하는것이 아니다.
// fuel 컬렉션의 문서 한행 보여주고, repair 컬렉션의 문서 한행 보여준다고 생각하면된다. fuel 컬렉션차례일때 주유단가와 총 비용을 표시하고, repair 컬렉션차례일때 정비내역과 총 비용을 표시하면 된다.
// 테이블 구조 및 데이터 합성 규칙:
// Cloud Firestore의 repair와 fuel 컬렉션 데이터를 하나의 테이블로 합쳐서 표시합니다. 두 컬렉션의 데이터를 병합하는 것이 아니라, 각 컬렉션의 문서마다 별도의 행으로 표시합니다.
// 컬럼 구성:

// Date: year + "/" + month + "/" + day 형식 (예: "2025/05/01")
// 그룹: vehicleNumber로 drivers 컬렉션에서 group 조회
// 차량번호: vehicleNumber 그대로 표시
// 정비내역 · 주유단가:

// fuel 데이터일 때: fuelPrice (예: "1,580원/L")
// repair 데이터일 때: repairDescription (예: "엔진오일 교체")

// 총 비용:

// fuel 데이터일 때: totalFuelCost (예: "47,400원")
// repair 데이터일 때: repairCost (예: "85,000원")

// 중요: 같은 날짜, 같은 차량의 fuel과 repair 데이터가 있으면 각각 별도의 행으로 표시하며, 데이터를 합치지 않습니다. fuel 문서는 주유 관련 정보만, repair 문서는 정비 관련 정보만 해당 행에 표시합니다.

// 이 컴포넌트를 만들기 위해 지금 존재하는 src/ui/deskTop/components/repairAndFuelSection 폴더 안에 필요한 컴포넌트들을 만들고, 그 컴포넌트들을 조합하여 index.tsx 파일을 만들어야 한다.
// 날짜 yyyy-mm-dd로 fuel과 repair의 데이터를 가져오는 기능은 아직 src/features/repair와 src/features/fuel에 없다. 차량번호로 조회하는것밖에 없다. 그래서 기존 fuel과 repair에 날짜와 날짜 범위로 조회하는 기능을 추가해야 한다.
// 조회는 단방향 데이터 흐름이다. 컴포넌트->rtk->usecase->service 순으로 이뤄지고 필요하다면 셀렉터에도 기능을 추가하라. src/features/fuel와 src/features/repair에 이미 필요한 모든 폴더는 있어서 이미 있는 파일에 기능을 추가하라.
// 결론적으로 repairAndFuelSection컴포넌트에서 fuel과 repair의 rtk를 사용하여 데이터를 가져오면 되는것이다.
