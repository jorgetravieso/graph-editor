import React, { Component, PropTypes} from 'react';
import { reduxForm } from 'redux-form';
import { createPost } from '../actions/index';
import { Link } from 'react-router';

class NetworkNew extends Component {

    static contextTypes = {
        router: PropTypes.object
    };

    onSubmit(props) {
        //a promise
        this.props.createPost(props)
            .then(() => {
                this.context.router.push('/');
            });
    }

    render() {
        //eq. to const handleSubmit = this.props.handleSubmit, etc;
        const { fields: { title, categories, content }, handleSubmit } = this.props;
        return (
            // redux-form's handleSubmit will call createPost with the form props
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <h3>New Post</h3>
                <div className={`form-group ${title.touched && title.invalid ? 'has-danger' : ''}`}>
                    <label>Title</label>
                    <input type="text" className="form-control" {...title}/>
                    <div className="text-help">
                        {title.touched ? title.error: ''}
                    </div>
                </div>
                <div className={`form-group ${categories.touched && categories.invalid ? 'has-danger' : ''}`}>
                    <label>Categories</label>
                    <input type="text" className="form-control" {...categories}/>
                    <div className="text-help">
                        {categories.touched ? categories.error: ''}
                    </div>
                </div>
                <div className={`form-group ${content.touched && content.invalid ? 'has-danger' : ''}`}>
                    <label>Content</label>
                    <textarea type="text" className="form-control" {...content}/>
                    <div className="text-help">
                        {content.touched ? content.error: ''}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
                <Link to="/" className="btn btn-danger">Cancel</Link>
            </form>
        );
    }
}

function validate(values) {
    const errors = {};

    if (!values.title){
        errors.title = 'Enter a title';
    }

    if (!values.categories) {
        errors.categories = 'Enter the categories'
    }

    if (!values.content) {
        errors.content = 'Enter the content'
    }

    return errors;
}


/**
    user types something... record it on application state
    state === {
        form: {
            title: '...',
            categories: '...'
        }
    }

    reduxForm behave like connect() from redux, just that it has 3 args
    reduxForm(config, mapStateToProps, mapDispatchToProps)
*/
export default reduxForm({
    form: 'PostNewForm',
    fields: ['title', 'categories', 'content'],
    validate
}, null, { createPost })(NetworkNew);