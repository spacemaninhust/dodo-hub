import { FC } from "react"
const Notfound:FC = ()=>{
    return (
        <div>
           <div id="refuse-submit" className="refuse-submit">
                <h2 style={{marginTop:'8%'}}>该页面不存在哦！</h2>
                <img src="./keli.gif" alt="keli" id='keli'/>
            </div>
        </div>
    )
}
export default Notfound