import './App.css'
import {useEffect, useMemo, useState} from "react";
import {AssignmentDto, Course, CourseDto, LessonDto, NewCourseDto} from "./types/courseTypes.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import CourseDetailsPage from "./pages/CourseDetails/CourseDetailsPage.tsx";
import CourseCreator from "./pages/CourseCreator.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import LessonOverview from "./pages/CourseDetails/Lesson/LessonOverview.tsx";
import AssignmentOverview from "./pages/CourseDetails/Assignment/AssignmentOverview.tsx";
import LessonPage from "./pages/CourseDetails/Lesson/LessonPage.tsx";
import AssignmentPage from "./pages/CourseDetails/Assignment/AssignmentPage.tsx";
import LessonCreator from "./pages/CourseDetails/Lesson/LessonCreator.tsx";
import AssignmentCreator from "./pages/CourseDetails/Assignment/AssignmentCreator.tsx";
import SubmissionPage from "./pages/CourseDetails/Assignment/SubmissionPage.tsx";
import {convertToCourse} from "./utils/convertToCourse.ts";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {AppUser, Instructor, Student, UserLoginDto} from "./types/userTypes.ts";
import ProtectedRoutes from "./components/Routes/ProtectedRoutes.tsx";
import Header from "./components/Layout/Header.tsx";
import ProtectedInstructorRoutes from "./components/Routes/ProtectedInstructorRoutes.tsx";
import {checkIsInstructor} from "./utils/checkIsInstructor.ts";
import {AuthContext} from "./context/AuthContext.ts";
import UserAccountPage from "./pages/UserAccountPage.tsx";
import {createTheme, ThemeProvider} from "@mui/material";
import {themeOptions} from "./styles/themeOptions.ts";
import ParticipantOverview from "./pages/CourseDetails/Participant/ParticipantOverview.tsx";
import BrowsePage from "./pages/BrowsePage/BrowsePage.tsx";
import axiosInstance from "./api/axiosInstance.ts";
import axios, {AxiosResponse} from "axios";

export default function App() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [currentCourse, setCurrentCourse] = useState<Course | undefined>();
    const [user, setUser] = useState<AppUser | null | undefined>();
    const [isInstructor, setIsInstructor] = useState<boolean>(false);
    const navigate = useNavigate();
    const theme = createTheme({cssVariables: true,...themeOptions});

    const authContextValue = useMemo(() => ({ user, isInstructor}), [user, isInstructor]);

    const fetchCourses = () => {
        axiosInstance.get("/api/courses")
            .then((response : AxiosResponse<CourseDto[]>) => setCourses(response.data.map(convertToCourse)))
            .catch((error) => console.error(error))
    }

    const createCourse = (course : NewCourseDto)  => {
        axiosInstance.post("/api/courses", course)
            .then((response : AxiosResponse<CourseDto>) => {
                setCourses([...courses, convertToCourse(response.data)]);
                navigate(`/course/${response.data.id}`);
            })
            .catch((error) => console.error(error.response.data));
    }
    const fetchCourse = (id: string) => {
        axiosInstance.get(`/api/courses/${id}`)
            .then((response: AxiosResponse<CourseDto>) => {
                setCurrentCourse(convertToCourse(response.data));
            })
            .catch((error) => {
                console.error(error.response.data);
                setCurrentCourse(undefined);
            });
    }

    const updateCourse = (updatedProperty: string, updatedValue: string | string[] | LessonDto[] | AssignmentDto[], courseToUpdate = currentCourse) => {
        axiosInstance.put(`/api/courses/${courseToUpdate?.id}`, {...courseToUpdate, [updatedProperty]: updatedValue})
            .then((response: AxiosResponse<CourseDto>) => {
                    const updatedCourse = convertToCourse(response.data);
                    setCourses(courses.map(course => course.id === updatedCourse.id ? updatedCourse : course));
                    if (currentCourse?.id === updatedCourse.id) setCurrentCourse(updatedCourse);
            })
            .catch((error)=>console.error(error.response.data));
    }


    const deleteCourse = (courseId: string) => {
        axiosInstance.delete(`/api/courses/${courseId}`)
            .then(() => {
                setCourses(courses.filter(course => course.id !== courseId))
            })
            .catch((error)=> console.error(error.response.data))
    }

    async function fetchUser() : Promise<void> {
        return axiosInstance.get("/api/auth/me")
            .then((response) => {
                setUser(response.data)
                setIsInstructor(checkIsInstructor(response.data))
            })
            .catch(error => {
                console.error(error.response.data)
                setUser(null);
            });
    }

    const login = (user: UserLoginDto) => {
        axios.get("/api/auth/me", {
            auth: {
                username: user.email,
                password: user.password
            }
        })
            .then((response)=> {
                setUser(response.data)
                setIsInstructor(checkIsInstructor(response.data))
                fetchCourses();
                // fetchStudents();
                // fetchInstructors();
                navigate("/");
            })
            .catch(error => {
                setUser(null);
                console.error(error.response.data)
            })
    }

    const logout = () => {
        axiosInstance.post("/api/auth/logout")
            .then(() => {
                console.log('Logged out')
                navigate("/login")
            })
            .catch((error) => console.error(error))
            .finally(()=>setUser(null));
    }

    const updateUser = (updatedProperty: string, updatedValue: string) => {
        if (user) axiosInstance.put(`/api/users/${user.id}`, {...user, [updatedProperty]: updatedValue})
            .then((response) => {
                setUser(response.data)
            })
            .catch((error)=>console.error(error.response.data));
    }

    const updateStudent = (updatedProperty?: string, updatedValue?: string, student = user?.student) => {
        if (user && student) {
            if (updatedProperty && updatedValue) student = {...student, [updatedProperty]: updatedValue};
            axiosInstance.put(`/api/students/${student.id}`, student)
                .then((response) => {
                    setUser({...user, student: response.data})
                })
                .catch((error)=>console.error(error.response.data));
        }
    }

    const updateInstructor = (updatedProperty?: string, updatedValue?: string, instructor = user?.instructor) => {
        if (user && instructor) {
            if (updatedProperty && updatedValue) instructor = {...instructor, [updatedProperty]: updatedValue};
            axiosInstance.put(`/api/instructors/${instructor.id}`, instructor)
                .then((response) => {
                    setUser({...user, instructor: response.data})
                })
                .catch((error)=>console.error(error.response.data));
        }
    }

    const updateUserCourses = (courseId: string, isAdded: boolean, userToUpdate?: Student | Instructor): void => {
        if (!userToUpdate && user) {
            userToUpdate = isInstructor ? user.instructor : user.student;
        }
        if (userToUpdate) {
            if (isAdded) {
                userToUpdate.courses.push(courseId);
            } else {
                userToUpdate.courses = userToUpdate.courses.filter(course => course !== courseId);
            }
            if ('grades' in userToUpdate) {
                updateStudent(undefined, undefined, userToUpdate);
            } else {
                updateInstructor(undefined, undefined, userToUpdate);
            }
        }
    }

    const deleteUser = (id: string) => {
        axiosInstance.delete(`/api/users/${id}`)
            .then(() =>  {
                logout();
            })
            .catch((error)=>console.error(error.response.data));
    }

    useEffect(()=>{
        fetchUser()
            .then(()=> {
                fetchCourses();
            })
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <AuthContext.Provider value={authContextValue}>
                <Header logout={logout}/>
                <main>
                        <Routes>
                            <Route path={"/register"} element={<RegisterPage />}/>
                            <Route path={"/login"} element={<LoginPage login={login}/>}/>
                            <Route element={<ProtectedRoutes />}>
                                <Route path={"/"} element={<Dashboard courses={courses} deleteCourse={deleteCourse} updateUser={updateUserCourses} updateCourse={updateCourse}/>}/>
                                <Route path={"/browse"} element={<BrowsePage courses={courses} deleteCourse={deleteCourse} updateUser={updateUserCourses} updateCourse={updateCourse}/>}/>
                                <Route path={"/account"} element={<UserAccountPage updateUser={updateUser} deleteUser={deleteUser} updateInstructor={updateInstructor} updateStudent={updateStudent}/>}/>
                                <Route path={"/course/:courseId"} element={<CourseDetailsPage updateCourse={updateCourse} course={currentCourse} fetchCourse={fetchCourse} deleteCourse={deleteCourse}  updateUser={updateUserCourses}/>}>
                                    <Route index element={<ParticipantOverview updateCourse={updateCourse}/>}/>
                                    <Route path={"lessons"} element={<LessonOverview updateCourse={updateCourse}/>}/>
                                    <Route path={"lessons/:lessonId"} element={<LessonPage updateCourse={updateCourse}/>}/>
                                    <Route path={"assignments"} element={<AssignmentOverview updateCourse={updateCourse}/>}/>
                                    <Route path={"assignments/:assignmentId"} element={<AssignmentPage updateCourse={updateCourse}/>}/>
                                    <Route path={"assignments/:assignmentId/submission/:submissionId"} element={<SubmissionPage updateCourse={updateCourse}/>}/>
                                    <Route element={<ProtectedInstructorRoutes />}>
                                        <Route path={"lessons/create"} element={<LessonCreator updateCourse={updateCourse} course={currentCourse}/>}/>
                                        <Route path={"assignments/create"} element={<AssignmentCreator updateCourse={updateCourse} course={currentCourse}/>}/>
                                    </Route>
                                </Route>
                                <Route element={<ProtectedInstructorRoutes/>}>
                                    <Route path={"/course/create"} element={<CourseCreator createCourse={createCourse} />}/>
                                </Route>
                            </Route>
                        </Routes>
                </main>
            </AuthContext.Provider>
        </ThemeProvider>
    )
}