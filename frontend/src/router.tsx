import { createHashRouter } from "react-router-dom"
import Filecollecting from "./pages/File_collecting"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Mycollection from "./pages/Mycollection"
import Filesubmitting from "./pages/File_submitting"
import Filepreview from "./pages/File_preview"
import Personel from "./pages/Personel_hompage"
import CollectionDetails from "./pages/Collection_details"
import FileEdit from "./pages/File_edit"
import Filerestart from "./pages/File_restart"
import Filecopy from "./pages/File_copy"
import Notfound from "./pages/404"
const router = createHashRouter([
    {
      path: "",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/file_collecting",
      element: <Filecollecting />,
    },
    {
      path: "/mycollection",
      element: <Mycollection />,
    },
    {
      path: "/Personel",
      element: <Personel />,
    },
    {
      path: "/CollectionDetails",
      element: <CollectionDetails />,
    },
    {
      path: "/file_submitting/:id",
      element: <Filesubmitting />,
    },
    {
      path: "/file_preview",
      element: <Filepreview />,
    },
    {
      path:"/file_edit",
      element: <FileEdit />,
    },
    {
      path:"/file_restart",
      element: <Filerestart />,
    },
    {
      path:"/file_copy",
      element: <Filecopy />,
    },
    {
      path: "*",
      element: <Notfound />,
    }
])
export default router