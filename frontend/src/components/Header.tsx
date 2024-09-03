import {Link} from "react-router-dom";
import {AuthContext} from "./AuthContext.tsx";
import {useContext} from "react";

type HeaderProps = {
    handleLogout: () => void;
}

export default function Header({handleLogout}:HeaderProps) {
    const {user} = useContext(AuthContext);
    return (
        <header>
            <h1>Learning Management System</h1>
            <Link to={"/signup"}>Sign Up</Link>
            {user ? <button onClick={handleLogout}>Logout</button> : <Link to={"/login"}>Login</Link>}
        </header>
    );
};