declare module "process" {
    global {
        namespace NodeJs {
            interface ProcessEnv {
                DATABASE_URL?: string;
                JWT_SECRET?: string;
            }
        }
    }
}
