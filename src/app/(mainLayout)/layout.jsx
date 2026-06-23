
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



export default function RootLayout({ children }) {
    return (
        <div>
            <Navbar></Navbar>
            <div className="grow flex flex-col">{children}</div>
            <Footer></Footer>
        </div>
    );
}
