export interface UserAuth {
  nickname: string;
  password: string;
}

export interface AuthAPIResponse {
  status: 200,
  message: "User Created",
  user: {
    id: string;
    nickname: string;
    jwt: string;
  }
}

export interface User {
  id: string;
  nickname: string;
}

export interface Message {
  chatId: string;
  date: string;
  id: string
  message: string
  seenByTarget: boolean
  sender: string
  target: string
}
