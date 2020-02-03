---
layout: post
title: Fundamentals of git
date: "2014-01-06"
description: |

  I'm going to document here some basics about git. I think a lot of very
  skilled developers who use git everyday haven't yet "grocked" the
  fundamentals of how it works.

topic: application-development
---

I'm going to document here some basics about git. I think a lot of very
skilled developers who use git everyday haven't yet "grocked" the fundamentals
of how it works. For starters, I am going to define a glossary of terms
relating to git (more are available by running "git help glossary").

__working tree (or working copy)__<br>

The working tree is the name given to the files and folders you are able to
edit and are being managed by git.

__HEAD__<br>

The HEAD ref represents where you currently * are * in the git history. For
example, if you are on the master branch, your head is associated with the
most recent commit on the master branch.

__clean (working tree)__<br>

The working tree is considered clean (or pristine) if there is no difference
between the code contained in the working tree and the state of the commit
referenced by HEAD.

__sha__<br>

the sha is the canonical reference to a commit. All commits have a sha which
is a (practically) unique identifier of the commit.

__ref__<br>

A ref is any reference to a commit. a ref can be a branch or tag name, sha,
HEAD or it can also be part of git's special syntax for referencing commits.

## Different ways to reference commits

git provides many different ways to reference commits beyond a branch or tag
name. The two I am going to be using the most for this article are the
relative references. For example, to reference a commit's ancestor you would
use ^. Add more ^'s to move further back in time. Also, you can use ~number to
have the same affect. Some examples

~~~ sh
HEAD^  # => one commit behind HEAD
HEAD~1 #

HEAD^^^^^^^^^^ # => ten commits behind HEAD
HEAD~10        #
~~~

## Diffs, the working tree and HEAD

Any time a diff exists (seen by running "git diff") this is because of a
difference between HEAD and the working tree. If either of these change (the
HEAD changes, or the working tree changes) it changes the diff.

## reset

the `git reset` command moves the current location of HEAD. When adding
`--hard` to `git reset` it will also modify the working tree to match the new
commit that HEAD is associated with after being moved. HEAD is implied if no
ref is given. Some examples:

~~~ sh
git reset --hard
# is the same as
git reset --hard HEAD
~~~

This command moves HEAD to where it already is and modifies the working tree
to match. This has the effect of removing any diff on the current working
tree.

## checkout

It is possible to associate a branch with HEAD so that it remains associated
with HEAD as commits are created (rather than remaining associated with a
specific commit). This is achieved through "checking out" a branch. `git
checkout` can also be used to checkout any ref. `git checkout` differs from
`git reset --hard` in that it attemps to safely move HEAD, i.e. it will throw
an error if there is a diff that would be overwritten by the checkout.

## rebase (non-interactive)

`git rebase`, when used non-interactively, is a way of moving groups of
commits around within a project. `git rebase` is able to determine the common
ancestor of the current branch as well as the target, and move only the
commits that are different. For example:

~~~
      -----------* feature-001
    /
----*-----*
          ▲
          | master

git checkout feature-001
git rebase master

    | this commit used to be the
    | place where master and feature-001
    | diverged. It is no longer significant
    ▼
----*-----*-----------* feature-001
          ▲
          | master
~~~

## try it out!

__Make a new branch on a project and see if you can complete some of these git
related tasks with only using reset.__

1. Squash the last 5 commits on your current branch into one commit.
2. Split the most recent commit you made into two commits.

__Try doing this using checkout, reset, and rebase:__

1. split the 5th newest (~5) commit into two commits.

## rebase (interactive)

`git rebase -i` is a toolchain to help comlete some of the tasks described
above. It allows you to squash, split, and delete commits easily. For example,
`git rebase -i HEAD~5` will allow you to reorganize and edit the last 5
commits on your project. Try to complete the tasks above using `git rebase -i`.

I hoped this helped you understand git's core features a little bit more. It's
easy to use git without fully understanding what is going on, but it's
important to have a deep understanding of the working of git to trully take
advantage of it's power.
