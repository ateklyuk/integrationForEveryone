
export type Config = {
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    REDIRECT_URI: string,
    PORT: number,
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

export type getQuery = {
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
    code?: string | null,
    refresh_token?: string | null,
}