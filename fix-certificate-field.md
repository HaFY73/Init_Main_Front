# 자격증 발급기관 필드 수정 사항

## 문제
- 프론트엔드: Certificate 인터페이스에서 `issuer` 필드 사용
- 백엔드: `organization` 필드 사용
- 결과: 발급기관 정보가 저장되지 않음

## 해결 방법

### 1. src/app/spec-management/page.tsx 파일 수정

#### Certificate 인터페이스 수정 (71번째 줄 근처):
```typescript
// 변경 전
interface Certificate { id: string; name: string; issuer: string; acquisitionDate: string; }

// 변경 후
interface Certificate { id: string; name: string; organization: string; acquisitionDate: string; }
```

#### sections 배열에서 certificates 필드 수정 (955번째 줄 근처):
```typescript
// 변경 전
{ id: "certificates", title: "자격증", icon: <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />, data: certificates, fields: [{name: 'name', label: '자격증명'}, {name: 'issuer', label: '발급기관'}, {name: 'acquisitionDate', label: '취득일', type: 'date'}] },

// 변경 후
{ id: "certificates", title: "자격증", icon: <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />, data: certificates, fields: [{name: 'name', label: '자격증명'}, {name: 'organization', label: '발급기관'}, {name: 'acquisitionDate', label: '취득일', type: 'date'}] },
```

#### Resume 템플릿들에서 cert.issuer를 cert.organization으로 변경:

1. ClassicTemplate (385번째 줄 근처):
```typescript
// 변경 전
<p className="text-xs text-gray-600">{cert.issuer}</p>

// 변경 후  
<p className="text-xs text-gray-600">{cert.organization}</p>
```

2. ModernTemplate (433번째 줄 근처):
```typescript
// 변경 전
<p className="text-xs text-gray-600">{cert.issuer}</p>

// 변경 후
<p className="text-xs text-gray-600">{cert.organization}</p>
```

3. ResumePreview (507번째 줄 근처):
```typescript
// 변경 전
<ResumeItem key={cert.id} title={cert.name} subtitle={cert.issuer} date={cert.acquisitionDate} />

// 변경 후
<ResumeItem key={cert.id} title={cert.name} subtitle={cert.organization} date={cert.acquisitionDate} />
```

### 2. spec-api.ts의 updateCertificates 함수는 이미 올바르게 organization을 사용하고 있음

## 테스트 방법
1. 프론트엔드 서버 재시작
2. 스펙 관리 페이지에서 자격증 추가
3. 자격증명과 발급기관 입력 후 저장
4. 페이지 새로고침 후 발급기관 정보가 유지되는지 확인
