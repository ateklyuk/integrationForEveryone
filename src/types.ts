
export type Config = {
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REDIRECT_URI: string,
    PORT: number,
    DB_URI: string
}

export type ErrData = {
    config: {
      headers: {
          Authorization: string
      }
    },
    response: {
        data: {
            status: string | number,
            title: string
        },
        request: {
            host: string,
            _header: string
        },
    }
}
export type LoginRequest = {
    query: {
        referer: string,
        code: string
    }
}
export type LogoutRequest = {
    query: {
        account_id: number
    }
}
export type Token = {
    data: {
        token_type: string,
        expires_in: number,
        access_token: string,
        refresh_token: string
    }
}

export type GetQuery = {
    body: {
        account: {
            subdomain: string,
            id: string,
        }
    }
}

export type DataType = {
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    grant_type: string,
    code?: string,
    refresh_token?: string ,
}

export type FileData = {
    authorization_code?: string ,
    id?: number ,
    subdomain?: string ,
    token_type: string,
    expires_in: number,
    access_token: string,
    refresh_token: string,
    is_installed?: boolean
}
export type TestArgs = {
    accountId: number;
    subdomain: string;
    userId: number
}