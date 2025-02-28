declare module 'sqlite3' {
  namespace sqlite3 {
    interface Database {
      run(sql: string, params: any[], callback?: (this: { lastID: number, changes: number }, err: Error | null) => void): this;
      run(sql: string, callback?: (this: { lastID: number, changes: number }, err: Error | null) => void): this;
      get(sql: string, params: any[], callback?: (err: Error | null, row: any) => void): this;
      get(sql: string, callback?: (err: Error | null, row: any) => void): this;
      all(sql: string, params: any[], callback?: (err: Error | null, rows: any[]) => void): this;
      all(sql: string, callback?: (err: Error | null, rows: any[]) => void): this;
      each(sql: string, params: any[], callback?: (err: Error | null, row: any) => void, complete?: (err: Error | null, count: number) => void): this;
      each(sql: string, callback?: (err: Error | null, row: any) => void, complete?: (err: Error | null, count: number) => void): this;
      exec(sql: string, callback?: (err: Error | null) => void): this;
      prepare(sql: string, params: any[], callback?: (err: Error | null) => void): Statement;
      prepare(sql: string, callback?: (err: Error | null) => void): Statement;
      close(callback?: (err: Error | null) => void): void;
      configure(option: string, value: any): void;
    }

    interface Statement {
      bind(params: any[], callback?: (err: Error | null) => void): this;
      bind(...params: any[]): this;
      reset(callback?: (err: Error | null) => void): this;
      finalize(callback?: (err: Error | null) => void): void;
      run(params: any[], callback?: (err: Error | null) => void): this;
      run(...params: any[]): this;
      get(params: any[], callback?: (err: Error | null, row: any) => void): this;
      get(...params: any[]): this;
      all(params: any[], callback?: (err: Error | null, rows: any[]) => void): this;
      all(...params: any[]): this;
      each(params: any[], callback?: (err: Error | null, row: any) => void, complete?: (err: Error | null, count: number) => void): this;
      each(...params: any[]): this;
    }

    function verbose(): sqlite3;
  }

  export = sqlite3;
}