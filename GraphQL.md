# GraphQL

> REST API 설계 패러다임을 대체하고, 서버의 데이터와 기능을 노출하기 위한 새로윤 표준으로 거듭나고 있다.

- `graphql-yoga` : 손쉬운 설정, 성능, 그리고 탁월한 개발자 경험에 초점을 둔 전기능 GraphQL 서버다. `Express`, `apollo-server`, `graphql-js` 등을 기반으로 한다.
- **Prisma** : 기존의 ORM을 대체한다. Prisma 클라이언트를 사용하여 GraphQL 리졸버를 구현하고 데이터베이스 접근을 간소화할 수 있다.
- **GraphQL Playground** : 쿼리와 뮤테이션을 전송하면서 GraphQL API의 기능을 직접 사용해 볼 수 있는 "GraphQL IDE"다. (Postman과 유사한 기능)
  - 사용 가능한 API 동작을 설명하는 문서를 자동 생성한다.
  - 쿼리, 뮤테이션, 구독을 작성할 수 있는 에디터를 제공한다.
    - 자동 완성, 문법 강조 기능도 제공한다.
  - API 동작을 간단히 공유할 수 있다.



## graphql-yoga

### 제공 기능

- GraphQL 명세의 준수
- 파일 업로드 지원
- GraphQL 구독을 사용한 실시간 기능
- TypeScrpit 지원
- GraphQL Playground을 훌륭하게 지원
- Express 미들웨어를 통한 확장성
- GraphQL 스키마에서 별도로 정의한 지시자(Directive)를 리졸브
- 쿼리 성능 추적
- `application/json`과 `application/graphql`의 Content-type를 모두 허용
- `now`, `up` AWS Lambda, Heroku 등 다양한 서비스에서 작동



## GraphQL 스키마

  GraphQL 스키마는 주로 **스키마 정의 언어(SDL)**를 사용하여 작성한다. SDL은 데이터 구조를 정의할 수 있는 타입 체계를 갖추고 있다.

  모든 GraphQL 스키마는 3가지의 특별한 **최상위 타입**을 갖는다. 각각은 `Query`, `Mutation`, `Subscription`이다. 각 최상위 타입은 GraphQL이 제공하는 3가지 동작 타입인 쿼리, 뮤테이션, 구독에 대응한다. 각 최상위 타입이 가지는 필드를 **최상위 필드**라고 부르며 사용가능한 API 동작을 정의한다.

```javascript
type Query {
	info: String!
}
```

>  위 스키마는 `info`라는 단 하나의 최상위 필드만을 갖는다.
>
> 지금의 경우 최상위 필드가 하나만 존재하기 때문에 API가 허용할 수 있는 쿼리는 단 하나이다.



```javascript
type Query {
    users: [User!]!
    user(id: ID!): User
}

type Mutation {
    createUser(name: String!): User!
}
    
type User {
    id:ID!
    name: String!
}
```

> 위의 코드는 3가지 최상위 필드를 갖는다. `Query` 타입의 `users`와 `user` 그리고 `Mutation` 타입의 `createUser`다.
>
> `User` 타입은 반드시 추가적으로 정의가 이루어져야 한다. 그렇지 않으면 스키마 정의가 완성되지 않는다.



- 최상위 필드의 타입이 `User` 같은 객체 타입인 경우

  > `info`의 경우는 `String` 타입이었고, 이것은 **Scalar**타입이다.

  - 해당 객체 타입에 포함된 필드를 사용하여 쿼리(뮤테이션/구독)을 확장할 수 있다.
  - 이렇게 확장된 부분을 **선택 집합**이라 부른다.



- 위의 스키마를 구현한 GraphQL API에 허용되는 동작들의 예시는 아래와 같다.

```javascript
# 모든 사용자 정보에 대한 쿼리
query {
    users {
        id
        name
    }
}

# ID를 사용하여 단일 사용자 정보에 대한 쿼리
query {
    user(id: "user-1") {
        id
        name
    }
}

# 새로운 사용자 생성
mutation {
    createUser(name : "Bob"){
        id
        name
    }
}
```

> 선택 집합 내의 필드들의 경우, 최상위 필드가 반드시 `null` 이외의 값을 반환하는지 또는 여러 항목을 반환하는 지 등의 여부는 중요하지 않다.
>
> 예를 들어 위의 스키마의 경우 3가지 최상위 필드는 모두 똑같은 `User` 타입에 대하여 각기 다른 **타입 한정자**를 사용하고 있다.
>
> - `users` 필드의 경우, 반환 타입이 `[User!]!`인 것은 반환값이 `User` 항목으로 이루어진 리스트(리스트 자체도 `null`일 수 없다.)라는 의미다.
>   - 빈 리스트를 받거나, `null`이 아닌 `User` 객체로 이루어진 리스트를 받는다.
> - `user(ud: ID!)` 필드의 경우, 반환 타입이 `User` 인 것은 반환값이 `null` 또는 `User` 객체라는 의미다.
>   - `createUser(name: String!)` 필드의 경우, 반환 타입이 `User!`인 것은 이 동작이 항상 `User` 객체를 반환한다는 의미다.

이러한 정보를 제대로 제공한다면, `Prisma` 인스턴스는 데이터베이서 서비스에 완전히 접근할 수 있고 들어오는 요청을 리졸브하는 데에 사용될 수 있게 된다.



### 스키마 정의의 확장

- `feed`쿼리는 `Link` 요소의 리스트를 반환받는다.
  - 새로운 최상위 필드(필요의 경우, 새로운 데이터 타입도 추가)를 추가하여 GraphQL 스키마 정의를 확장한다.
  - 새로 추가된 필드에 대응하는 리졸버 함수를 구현한다.
- 위 과정은 스키마 주도(Schema-Driven) 또는 스키마 우선(Schema-First) 개발이라고 불린다.

```javascript
const typeDefs = `
  type Query {
    info: String!
    feed: [Link!]!        // 수정
  }

  type Link {             // 수정
    id: ID!               // 수정
    description: String!  // 수정
    url: String!          // 수정
 }                        // 수정
`
```

- `feed` 쿼리를 위한 리졸버 함수를 구현해야 한다. 
  - GraphQL 스키마는 모든 필드가 리졸버 함수를 갖는다.



### 쿼리 리졸브 과정



### shema.graphql

: 프론트엔드 어플리케이션에서 서버에 전송할 수 있는 모든 동작들(쿼리, 뮤테이션, 구독 등)을 정의하는 GraphQL 스키마를 포함한다.



- Queries
  - `feed` : 백엔드로부터 모든 링크들을 반환한다. 참고로 이 쿼리는 필터링, 정렬, 페이지 매기기 기능을 위한 인자를 받을 수 있다.
- Mutations
  - `post` : 인증된 사용자가 새로운 링크를 생성한다.
  - `signup` : 새로운 사용자를 위한 계정을 생성한다.
  - `login` : 기존의 사용자가 로그인한다.
  - `vote` : 인증된 사용자가 어떤 링크에 대하여 투표한다.
- Subscriptions
  - `newLink` : 새로운 링크가 생성되었을 때 실시간 갱신을 받는다.
  - `newVote` : 새로운 투표가 이루어졌을 때 실시간 갱신을 받는다.



#### ex.

```javascript
{
    feed(skip: 0, first: 10){
        links {
            description
            url
            postedBy {
                name
            }
        }
    }
}
```

> 위의 `feed` 쿼리를 전송하여 서버로부터 첫 10개의 링크를 받을 수 있다



```javascript
mutation {
    signup(
    name: "Sarah",
    email: "sarah@graph.cool",
    password:'graphql'
    ){
        token
        user{
            id
        }
    }
}
```

> 위의 `signup` 뮤테이션을 전송하여 새로운 사용자를 생성한다.





- `typeDefs` : 어플리케이션의 스키마에서 가져온 타입 정의
- `resolvers` : 어플리케이션의 스키마로부터 `Query`, `Mutation`, `Subscription` 타입과 각 타입이 가진 필드들을 반영한 자바스크립트 객체다. 이 객체에는 어플리케이션 스키마상의 각 필드와 동일한 이름을 가진 함수가 들어있다.
- `context` : 리졸버 체인을 거쳐서 전달된 객체로, 모든 리졸버는 이 객체에 대하여 읽기 및 쓰기 동작을 수행할 수 있다.