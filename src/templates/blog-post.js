import React from 'react'
import { Link, graphql } from 'gatsby'

import Bio from '../components/bio'
import Layout from '../components/layout'
import SEO from '../components/seo'
import { rhythm, scale } from '../utils/typography'

const GITHUB_USERNAME = 'quinn'
const GITHUB_REPO_NAME = 'blog'

const viewUrl = slug =>
	`https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/tree/master/content/blog/${slug}/index.md`


const discussUrl = slug =>
	`https://twitter.com/intent/tweet?text=${encodeURIComponent(
		`https://quinn.io${slug}`
	)}`

const BlogPostTemplate = ({ data, pageContext, location }) => {
	const post = data.markdownRemark
	const siteTitle = data.site.siteMetadata.title
	const { previous, next } = pageContext

	return (
		<Layout location={location} title={siteTitle}>
			<SEO
				title={post.frontmatter.title}
				description={post.frontmatter.description || post.excerpt}
			/>
			<article>
				<header>
					<h1
						style={{
							marginTop: rhythm(1),
							marginBottom: 0,
						}}
					>
						{post.frontmatter.title}
					</h1>
					<p
						style={{
							...scale(-1 / 5),
							display: `block`,
							marginBottom: rhythm(1),
						}}
					>
						{post.frontmatter.date}
					</p>
				</header>
				<section dangerouslySetInnerHTML={{ __html: post.html }} />
				<hr
					style={{
						marginBottom: rhythm(1),
					}}
				/>
				<footer>
					<p>
						<a href={discussUrl(post.fields.slug)} target="_blank" rel="noopener noreferrer">
							Discuss on Twitter
						</a>
						{` • `}
						<a href={viewUrl(post.fields.slug)} target="_blank" rel="noopener noreferrer">
							View on GitHub
						</a>
					</p>
				<hr
					style={{
						marginBottom: rhythm(1),
					}}
				/>

					<Bio />
				</footer>
			</article>

			<nav>
				<ul
					style={{
						display: `flex`,
						flexWrap: `nowrap`,
						justifyContent: `space-between`,
						listStyle: `none`,
						padding: 0,
					}}
				>
					<li>
						{previous && (
							<Link to={previous.fields.slug} rel="prev">
								← {previous.frontmatter.title}
							</Link>
						)}
					</li>
					<li>
						{next && (
							<Link to={next.fields.slug} rel="next">
								{next.frontmatter.title} →
							</Link>
						)}
					</li>
				</ul>
			</nav>
		</Layout>
	)
}

export default BlogPostTemplate

export const pageQuery = graphql`
	query BlogPostBySlug($slug: String!) {
		site {
			siteMetadata {
				title
			}
		}

		markdownRemark(fields: { slug: { eq: $slug } }) {
			id
			excerpt(pruneLength: 160)
			html

			fields {
				slug
			}

			frontmatter {
				title
				date(formatString: "MMMM DD, YYYY")
				description
			}
		}
	}
`
