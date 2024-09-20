import {Link, Outlet, useParams} from "react-router-dom";
import {Course, CourseDto} from "../../types/courseTypes.ts";
import EditableTextDetail from "../../components/Shared/EditableTextDetail.tsx";
import {useAuth} from "../../hooks/useAuth.ts";
import CourseActions from "../../components/Course/CourseActions.tsx";
import {
    Breadcrumbs, Container,
    Grid2, InputLabel, ListItem, ListItemText, Paper,
    Typography, useMediaQuery, useTheme
} from "@mui/material";
import CourseTabs from "../../components/Course/CourseTabs.tsx";
import CourseTabsMobile from "../../components/Course/CourseTabsMobile.tsx";
import {CourseContextType} from "../../hooks/useCurrentCourse.ts";
import EditableRichText from "../../components/Shared/EditableRichText.tsx";
import {calculateCourseGradeAverage, calculateStudentGradeAverage } from "../../utils/calculateGradeAverage.ts";
import GradeDisplay from "../../components/Shared/GradeDisplay.tsx";
import {useDataObject} from "../../hooks/useDataObject.ts";
import {convertToCourse} from "../../utils/convertToCourse.ts";

type CoursePageProps = {
    updateCourse: (updatedProperty: string, updatedValue: string | string[]) => void,
    course: Course | undefined,
    fetchCourse: (courseId: string) => void,
    deleteCourse: (courseId: string) => void,
    updateUser: (courseId: string, isAdded: boolean) => void
}

export default function CourseDetailsPage({updateCourse, deleteCourse, updateUser}: Readonly<CoursePageProps>) {
    const theme = useTheme();
    const isMobile = !(useMediaQuery(theme.breakpoints.up('sm')));
    const { courseId } = useParams();
    const {user, isInstructor} = useAuth();

    const {data, loading, error} = useDataObject<CourseDto>(`/api/courses/${courseId}`);
    const course: Course | undefined = data && convertToCourse(data);

    const gradeAverage: number | undefined = (course && user?.student?.grades[course.id]) ? calculateStudentGradeAverage(user.student.grades[course.id]) : undefined;
    const courseAverage : number | undefined = (course) && calculateCourseGradeAverage(course);

    return (
        <>
        {course ?
                <Container>
                    <Breadcrumbs aria-label={"breadcrumb"}>
                        <Link to={"/"}>Dashboard</Link>
                        <Typography>{course?.title}</Typography>
                    </Breadcrumbs>
                    <ListItem
                        secondaryAction={<CourseActions course={course} deleteCourse={deleteCourse} updateUser={updateUser} updateCourse={updateCourse}/>}
                        disablePadding
                        component={"div"}
                        divider
                    >
                        <ListItemText secondary={course.id}>
                            <h2>
                                <EditableTextDetail inputType={"text"} label={"Title"} name={"title"}
                                                      initialValue={course.title} updateFunction={updateCourse}
                                                      allowedToEdit={isInstructor}/>
                            </h2>
                        </ListItemText>
                    </ListItem>
                    <Paper sx={{p:'15px'}}>
                        <Grid2 container spacing={{xs:2,sm:4}} direction={{xs:'column-reverse', sm: 'row'}} >
                            <Grid2 size={{xs:12,sm:8}}>
                                <EditableRichText label={"Description"} name={"description"} allowedToEdit={isInstructor} initialValue={course.description} updateFunction={updateCourse}/>
                            </Grid2>
                            <Grid2 size={{xs:12,sm:4}} display={"flex"} justifyContent={isMobile ? "flex-start" : "flex-end"} alignItems={"flex-start"}>
                                <EditableTextDetail inputType={"date"} label={"Start Date"} name={"startDate"}
                                                    initialValue={course.startDate.toISOString().substring(0,10)} updateFunction={updateCourse}
                                                    allowedToEdit={isInstructor}/>
                            </Grid2>
                        </Grid2>
                        {gradeAverage &&
                            <>
                                <InputLabel disabled shrink>Grade Average</InputLabel>
                                <GradeDisplay grade={gradeAverage}/>
                            </>
                        }
                        {(isInstructor && courseAverage) &&
                            <>
                                <InputLabel disabled shrink>Course Average</InputLabel>
                                <GradeDisplay grade={courseAverage}/>
                            </>
                        }
                    </Paper>
                    <Container disableGutters sx={{mt: 2}}>
                        {isMobile ? <CourseTabsMobile/> :
                            <CourseTabs/>}
                        <Paper sx={{p:'20px', pb: '40px'}} component={'section'} square={false}>
                            <Outlet context={{course} satisfies CourseContextType}/>

                        </Paper>
                    </Container>
                </Container>
            :
            <p>No course found.</p>
        }
        </>
    )
}