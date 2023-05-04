// 问题数据结构
export interface DataType {
    title:string,
    description:string,
    ans:number[],
    A:string,
    B:string,
    C:string,
    D:string
}
export interface DataTypes {
    qid:string,
    id:string,
    value:number,
    content:DataType,
    require:number
}
export interface DataTypess {
    qid:string,
    id:string,
    value:number,
    content:DataType,
    require:number,
    ans:string
}
export interface Restype{
    Qid:string,
    Seqnum:string,
    Qtype:string,
    Ans:string
}
export interface Restypes{
    Qid:string,
    Seqnum:string,
    Qtype:string,
    Ans:string,
    Title:string
}
export interface Collectiontype{
    Id:number,
    Title:string,
    Collector:string,
    Deadline:string,
    Sharelink:string,
    Submitcount:number,
    Status:number
}