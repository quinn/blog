const feedSerializer = ({ query: { site, allMarkdownRemark } }) => {
	return allMarkdownRemark.edges.map(edge => {
		const siteUrl = site.siteMetadata.siteUrl
		const postText = `
		<div style="margin-top=55px; font-style: italic;">(This is an article posted to my blog at quinn.io. You can read it online by <a href="${siteUrl +
			edge.node.fields.slug}">clicking here</a>.)</div>
	`

		let html = edge.node.html
		// Hacky workaround for https://github.com/gaearon/overreacted.io/issues/65
		html = html
			.replace(/href="\//g, `href="${siteUrl}/`)
			.replace(/src="\//g, `src="${siteUrl}/`)
			.replace(/"\/static\//g, `"${siteUrl}/static/`)
			.replace(/,\s*\/static\//g, `,${siteUrl}/static/`)

		return Object.assign({}, edge.node.frontmatter, {
			description: edge.node.frontmatter.description,
			date: edge.node.frontmatter.date,
			url: site.siteMetadata.siteUrl + edge.node.fields.slug,
			guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
			custom_elements: [{ 'content:encoded': html + postText }],
		})
	})
}

module.exports = {
	siteMetadata: {
		title: `Quinn's Blog`,
		author: `Quinn Shanahan`,
		description: `It's probably gonna mostly be about code`,
		siteUrl: `https://quinn.io/`,
		social: {
			twitter: `quinnshanahan`,
			github: `quinn`,
			instagram: `qshan`,
		},
	},
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/blog`,
				name: `blog`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/content/assets`,
				name: `assets`,
			},
		},
		{
			resolve: `gatsby-transformer-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-images`,
						options: {
							maxWidth: 590,
						},
					},
					{
						resolve: `gatsby-remark-responsive-iframe`,
						options: {
							wrapperStyle: `margin-bottom: 1.0725rem`,
						},
					},
					`gatsby-remark-prismjs`,
					`gatsby-remark-copy-linked-files`,
					`gatsby-remark-smartypants`,
				],
			},
		},
		`gatsby-transformer-sharp`,
		`gatsby-plugin-sharp`,
		{
			resolve: `gatsby-plugin-google-analytics`,
			options: {
				trackingId: process.env.GA_TRACKING_ID,
			},
		},
		`gatsby-plugin-feed`,
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Quinn's Blog`,
				short_name: `quinns-blog`,
				start_url: `/`,
				background_color: `#ffffff`,
				theme_color: `#663399`,
				display: `minimal-ui`,
				icon: `content/assets/gatsby-icon.png`,
			},
		},
		`gatsby-plugin-react-helmet`,
		{
			resolve: `gatsby-plugin-typography`,
			options: {
				pathToConfigModule: `src/utils/typography`,
			},
		},

		// this (optional) plugin enables Progressive Web App + Offline functionality
		// To learn more, visit: https://gatsby.dev/offline
		// `gatsby-plugin-offline`,
	],
}
