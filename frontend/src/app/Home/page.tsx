import Header from '../header/header';

export default function header(){
    return(
        <>
            <Header />
            <div style={
                {

                    height: "calc(100vh - 64px)",
                    display: 'flex',
                    alignItems:"center",
                    justifyContent:"center",
                    padding:"5px 10px 5px 10px",
                    backgroundColor:"white",
                    color:"black"
                }
            } >
                <button className='get-started-button'>Get Started</button>
                </div> 
        </>
    )
}