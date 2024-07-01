import React from 'react'
import './css/Login.css'

function Login() {
    return (
        <div id="container" className='d-flex justify-content-center align-items-center vh-100'>
            <div className='w'>
                <div className='header text-center mb-4'>
                    <div className='text'>Log In</div>
                    <div className='underline'></div>
                </div>
                <div className='bg-white p-3 rounded login-box'>
                    <form action="">
                        <div className="mb-3">
                            <label htmlFor="email" className='form-label'>Email</label>
                            <input type="email" id="email" className='form-control' placeholder="Enter Email" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className='form-label'>Password</label>
                            <input type="password" id="password" className='form-control' placeholder="Enter Password" />
                        </div>
                        <button type="submit" className='btn btn-success w-100 mb-3'>Log In</button>
                        <p className='text-center'>or</p>
                        <button type="button" className='btn btn-default border w-100'>Create an Account</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;