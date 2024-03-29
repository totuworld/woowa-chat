# woowa-chat
우수타에서 질문과 투표를 돕는 서비스

## 주요 기능
* 우수타 이벤트를 생성할 수 있다.
* 이벤트 생성 시 간단할 설명과 타이틀용 이미지를 등록할 수 있다.
* 관리자는 이벤트를 강제 종료할 수 있다.
* 관리자는 특정 질문을 deny할 수 있다.

### 질문 등록 기간 내 사용자가 화면 진입 시
* 질문 등록할 수 있음.

### 질문 등록 기간 내 관리자가 화면 진입 시
* 질문 등록할 수 있음.
* 등록된 질문 목록을 확인할 수 있음.
* deny할 수 있음.


### 댓글 및 투표 기간 내 사용자가 화면 진입 시
* 질문 목록이 노출된다.
  * 단 deny된 항목은 메시지를 빈 문자열로 바꾸고, deny 여부를 함께 전달한다.
* 질문에 좋아요 갯수를 표시한다.
* 내가 좋아요를 클릭한 경우 좋아요 클릭 했음을 알 수 있도록 표시된다.
* 좋아요 클릭 후 다시 좋아요를 누르면 좋아요가 해제된다.
* 질문에 댓글을 작성할 수 있다.
  * 이때 실명으로 댓글을 달지 선택가능하다.

## 개발환경 준비

### .env 생성하기
아래 필드가 모두 필요하다.
```
publicApiKey=firebase - web client용
FIREBASE_AUTH_HOST=firebase - web client용
privateKey=firebase - admin용
clientEmail=firebase - admin용
projectId=firebase
```