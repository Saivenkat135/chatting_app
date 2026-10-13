import "../../CSS/signin.css"
import Header from '../../header/header';
export default function Signup(){
    return (
        <>
        <Header />
        <div className="full-page">
            <div className="sign-left-section"></div>
            <div className="sign-right-section">
                <div className="form">
                    <div className="title">Sign Up</div>
                        <div className="text">Enter the Name</div>
                        <input className="input" placeholder="Enter the name"/>

                        <div className="text">Enter the Email</div>
                        <input className="input" placeholder="Enter the email"/>

                        <div className="text">Enter the password</div>
                        <input className="input" placeholder="Enter the password"/>
                        
                        <button className="submit-button">Submit</button>
                </div>
            </div>
        </div>
        </>
    )
}