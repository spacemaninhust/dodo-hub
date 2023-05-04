import { FC,useEffect,useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import ParticlesBg from 'particles-bg'
import moment from "moment"
import { Collectiontype } from "../../components/datatype"
import Collections from "../../components/collections"
import './index.css'
// 定义数据测试使用
const iniCollection:Collectiontype[] = []
const Mycollection:FC = ()=>{
    // 收集列表
    const [collection,setCollection] = useState(iniCollection)
    // const getcollection = ()=>{
    //     const time = moment().format('YYYY-MM-DD HH:mm:ss')
    //     axios.get('/api/admin/statistics')
    //     .then((res)=>{
    //         // 获得收集信息
    //         const collections = eval(res.data.data.data)
    //         for(let i = 0;i < collections.length;i++){
    //             const sta = time<collections[i].Deadline?1:0
    //             let tmp:Collectiontype = {
    //                 Id:Number(collections[i].Id),
    //                 Title:String(collections[i].Title),
    //                 Collector:String(collections[i].Collector),
    //                 Deadline:String(collections[i].Deadline),
    //                 Sharelink:String(collections[i].Sharelink),
    //                 Submitcount:Number(collections[i].Submitcount),
    //                 Status:sta
    //             }
    //             collection.push(tmp)
    //         }
    //         setCollection([...collection])
    //         console.log(collection)
    //     })
    // }
    const addre = '/api/admin/statistics'
    useEffect(()=>{
        let ignore = false
        const f = async ()=>{
            const res = await axios(addre)
            if(!ignore){
                const time = moment().format('YYYY-MM-DD HH:mm:ss')
                const collections = eval(res.data.data.data)
                console.log(collection)
                // for(let i = 0;i < collection.length;i++){
                //     let tmp:Collectiontype = {
                //         Id:Number(collections[i].Id),
                //         Title:String(collections[i].Title),
                //         Collector:String(collections[i].Collector),
                //         Deadline:String(collections[i].Deadline),
                //         Sharelink:String(collections[i].Sharelink),
                //         Submitcount:,
                //         Status:
                //     }
                // }
                // setCollection([])
                for(let i = 0;i < collections.length;i++){
                    const sta = time<collections[i].Deadline?1:0
                    let tmp:Collectiontype = {
                        Id:Number(collections[i].Id),
                        Title:String(collections[i].Title),
                        Collector:String(collections[i].Collector),
                        Deadline:String(collections[i].Deadline),
                        Sharelink:String(collections[i].Sharelink),
                        Submitcount:Number(collections[i].Submitcount),
                        Status:sta
                    }
                    collection[i] = tmp
                }
                setCollection([...collection])
                console.log(collection)
            }
        }
        f()
        return () => {
            ignore = true
        }
    },[addre])
    // 删除函数,传给子组件使用
    const deleteCollections = (deleteIndex:number) => {
        collection.splice(deleteIndex,1)
        // 深拷贝
        setCollection([...collection])
    }
    return (
        <>
            <div className="bg"> 
                <ParticlesBg type="fountain" bg={true} /> 
            </div>  
            <div style={{display:'flex'}}>
                <div className="file_back">
                    <Link to="/" className="goback">
                        <img className="home" src="./home.svg" alt="svg1" />
                        返回首页
                    </Link>
                </div>
                <div className="collection">
                    <div id="cardContainer">
                        <h1>我的文件收集</h1>
                    </div>
                    {
                        collection.length === 0 ?
                        <div style={{textAlign:'center',fontSize:'20px'}}>
                            暂时无收集记录哦!
                            点<Link to='/File_collecting' className="linktocol">这里</Link>发布问卷吧!
                        </div>
                        :
                        <></>
                    }
                    {collection.map((item, index) => (
                        <Collections id={item.Id} link={item.Sharelink} index={index} status={item.Status} title={item.Title} collector={item.Collector} deadline={item.Deadline} number={item.Submitcount} deleteCollections={deleteCollections}></Collections>
                    ))}
                </div>
            </div>

        </>
    )
}
export default Mycollection