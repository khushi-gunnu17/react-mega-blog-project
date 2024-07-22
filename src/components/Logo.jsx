import React from "react";
import logo from "../assets/DotBlog_domain_logo.png"

function Logo({width = '100px'}) {
    return (
        <div>
            <img src={logo} alt="blog" className="w-24" />
        </div>
    )
}

export default Logo