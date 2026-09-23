import "../../CSS/signin.css";

export default function Signin(){
    return (
        <>
            <div className="full-page">
                <div className="left-section">
                    image
                </div>
                <div className="right-section">
                    <div className="form">
                        <div className="title">Sign In</div>
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