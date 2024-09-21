import CourseList from "../../components/Course/CourseList/CourseList.tsx";
import {Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.ts";
import {Button, Grid2, Paper} from "@mui/material";
import {useCourses} from "../../hooks/useCourses.ts";

type DashboardProps = {
    updateUser: (courseId: string, isAdded: boolean) => void,
}
export default function Dashboard({updateUser}: Readonly<DashboardProps>) {
    const {user, isInstructor} = useAuth();
    const {courses} = useCourses();

    return (
        <Paper elevation={3} square={false} sx={{p:'20px'}}>
        {user &&
                <Grid2 container spacing={2}>
                    <Grid2>
                        <p>Hello {user.student?.username ?? user.instructor?.username}!</p>
                    </Grid2>
                    <Grid2>
                        {isInstructor && <Button component={Link} to={"/course/create"} variant={"outlined"} color={"secondary"}>Create a Course</Button>}
                    </Grid2>
                    <Grid2 size={12}>
                        <section>
                            <h2>Your Courses</h2>
                            <CourseList
                                courses={courses
                                    .filter(course => user.student ? course.students.includes(user.student.id) : user.instructor ? course.instructors.includes(user.instructor?.id) : course)
                                    .toSorted((a, b) => a?.startDate.getTime() - b?.startDate.getTime())}
                                 updateUser={updateUser} />
                        </section>
                    </Grid2>
                </Grid2>
        }
        </Paper>
    )
}