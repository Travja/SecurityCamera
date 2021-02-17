export const VideoCard = props => {
    return (
        <article className="video-card">
            <div className="video">
                {props.VideoComponent}
            </div>
            <footer>
                {props.children}
            </footer>
        </article>
    );
}