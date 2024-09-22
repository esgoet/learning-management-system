import JoinOrLeaveCourse from "./JoinOrLeaveCourse.tsx";
import {Course} from "../../types/courseTypes.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import ConfirmedDeleteIconButton from "../Shared/ConfirmedDeleteIconButton.tsx";
import {useCourses} from "../../hooks/useCourses.ts";

type CourseActionsProps = {
    course: Course
};

export default function CourseActions({course}: Readonly<CourseActionsProps>) {
    const {isInstructor} = useAuth();
    const {deleteCourse} = useCourses();

    return (
        <>
            <JoinOrLeaveCourse course={course}/>
            {isInstructor && <ConfirmedDeleteIconButton toConfirmId={course.id} toConfirmName={course.title} toConfirmFunction={deleteCourse}/>}
        </>
    );
};